import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { and, eq } from "drizzle-orm";
import { render } from "@react-email/components";
import { db } from "@/lib/db";
import { purchases, subscriptions, users, articles, notifications } from "../../../../../drizzle/schema/index";
import { stripe } from "@/lib/stripe";
import { calculateAndRecordSplit, distributePooledSubscriptionRevenue } from "@/lib/revenue-split";
import { resend } from "@/lib/resend";
import { PurchaseReceiptEmail } from "@/emails/purchase-receipt";

type SubscriptionType = "author_pro" | "publication" | "platform";

const DASHBOARD_BASE_URL = process.env.AUTH_URL ?? "http://localhost:3000";

async function sendPurchaseReceipt(userId: string, itemLabel: string, amountCents: number, dashboardPath: string) {
  const [recipient] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!recipient) return;
  try {
    const html = await render(
      PurchaseReceiptEmail({
        recipientName: recipient.name ?? "",
        itemLabel,
        amountCents,
        dashboardUrl: `${DASHBOARD_BASE_URL}${dashboardPath}`,
      })
    );
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "Contributor <onboarding@resend.dev>",
      to: recipient.email,
      subject: `Your receipt for ${itemLabel}`,
      html,
    });
    if (error) {
      console.error("Failed to send purchase receipt email:", error.message);
    }
  } catch (err) {
    console.error("Failed to send purchase receipt email:", err);
  }
}

function statusFromStripe(status: Stripe.Subscription.Status): "active" | "cancelled" | "past_due" {
  if (status === "active" || status === "trialing") return "active";
  if (status === "past_due" || status === "unpaid") return "past_due";
  return "cancelled";
}

async function upsertSubscriptionFromStripe(
  stripeSubscription: Stripe.Subscription,
  userId: string,
  type: SubscriptionType,
  publicationId: string | null
) {
  const billingInterval = stripeSubscription.items.data[0]?.price.recurring?.interval === "year" ? "yearly" : "monthly";
  const item = stripeSubscription.items.data[0];
  const currentPeriodStart = new Date(item.current_period_start * 1000);
  const currentPeriodEnd = new Date(item.current_period_end * 1000);
  const status = statusFromStripe(stripeSubscription.status);

  const [existing] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscription.id))
    .limit(1);

  if (existing) {
    await db
      .update(subscriptions)
      .set({ status, billingInterval, currentPeriodStart, currentPeriodEnd })
      .where(eq(subscriptions.id, existing.id));
    return;
  }

  // A Platform subscription supersedes any existing active Publication
  // subscription for this user, per docs/00_ScopeDocument.md Section 6 /
  // Flow J — this must happen (cancel in Stripe, mark superseded locally)
  // BEFORE the new Platform row is inserted. The reverse (subscribing to
  // a Publication while already on Platform) is deliberately allowed,
  // not blocked — the UI just warns it's redundant.
  if (type === "platform") {
    const [existingPublicationSub] = await db
      .select()
      .from(subscriptions)
      .where(
        and(eq(subscriptions.userId, userId), eq(subscriptions.type, "publication"), eq(subscriptions.status, "active"))
      )
      .limit(1);
    if (existingPublicationSub?.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(existingPublicationSub.stripeSubscriptionId);
      } catch (err) {
        console.error("Failed to cancel superseded Publication subscription in Stripe:", err);
      }
      await db
        .update(subscriptions)
        .set({ status: "superseded" })
        .where(eq(subscriptions.id, existingPublicationSub.id));
    }
  }

  await db.insert(subscriptions).values({
    userId,
    type,
    publicationId,
    stripeSubscriptionId: stripeSubscription.id,
    stripeCustomerId:
      typeof stripeSubscription.customer === "string" ? stripeSubscription.customer : stripeSubscription.customer.id,
    status,
    billingInterval,
    currentPeriodStart,
    currentPeriodEnd,
  });
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      const subscriptionType = checkoutSession.metadata?.subscriptionType as SubscriptionType | undefined;
      if (checkoutSession.mode === "subscription" && subscriptionType) {
        const userId = checkoutSession.metadata!.userId;
        const publicationId = checkoutSession.metadata!.publicationId ?? null;
        const stripeSubscriptionId =
          typeof checkoutSession.subscription === "string" ? checkoutSession.subscription : checkoutSession.subscription?.id;
        if (userId && stripeSubscriptionId) {
          const [alreadyTracked] = await db
            .select({ id: subscriptions.id })
            .from(subscriptions)
            .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
            .limit(1);
          const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
          await upsertSubscriptionFromStripe(stripeSubscription, userId, subscriptionType, publicationId);

          // Only the first time this Stripe subscription is seen — a
          // renewal fires invoice.payment_succeeded, not another
          // checkout.session.completed, so this branch is inherently
          // create-only, but the existence check above still guards
          // against a duplicate webhook delivery for the same session.
          if (!alreadyTracked && checkoutSession.amount_total != null) {
            const itemLabel =
              subscriptionType === "author_pro"
                ? "AuthorPro subscription"
                : subscriptionType === "platform"
                  ? "Platform subscription"
                  : "Publication subscription";
            await sendPurchaseReceipt(userId, itemLabel, checkoutSession.amount_total, "/dashboard/reader/subscriptions");

            if (subscriptionType === "author_pro") {
              await db.insert(notifications).values({
                userId,
                type: "author_pro_activated",
                message: "Your AuthorPro subscription is now active — you can publish Premium articles.",
                linkUrl: "/dashboard/author/billing",
              });
            }
          }
        }
      } else if (checkoutSession.mode === "payment" && checkoutSession.metadata?.purchaseType === "article") {
        const { articleId, userId } = checkoutSession.metadata;
        const paymentIntentId =
          typeof checkoutSession.payment_intent === "string"
            ? checkoutSession.payment_intent
            : checkoutSession.payment_intent?.id ?? null;
        if (articleId && userId && checkoutSession.amount_total != null && paymentIntentId) {
          const [existing] = await db
            .select({ id: purchases.id })
            .from(purchases)
            .where(eq(purchases.stripePaymentIntentId, paymentIntentId))
            .limit(1);
          if (!existing) {
            const [purchase] = await db
              .insert(purchases)
              .values({
                userId,
                articleId,
                amountCents: checkoutSession.amount_total,
                stripePaymentIntentId: paymentIntentId,
              })
              .returning();
            await calculateAndRecordSplit(articleId, checkoutSession.amount_total, "purchase", purchase.id);

            const [article] = await db.select({ title: articles.title }).from(articles).where(eq(articles.id, articleId)).limit(1);
            await sendPurchaseReceipt(
              userId,
              article ? article.title : "your article purchase",
              checkoutSession.amount_total,
              "/dashboard/reader/purchases"
            );
          }
        }
      }
      break;
    }
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      // billing_reason distinguishes the invoice that creates a brand
      // new subscription ("subscription_create") from a renewal
      // ("subscription_cycle"). The create-time invoice has no prior
      // period to distribute — the subscription row was just inserted
      // with its FIRST period's bounds, so there is nothing that "just
      // ended" yet. Only renewals trigger pooled distribution; skipping
      // this check would write a spurious 100%-to-platform ledger row
      // one billing cycle too early on every new subscription.
      if (invoice.billing_reason === "subscription_cycle") {
        const subscriptionRef = invoice.parent?.subscription_details?.subscription;
        const stripeSubscriptionId = typeof subscriptionRef === "string" ? subscriptionRef : subscriptionRef?.id;
        if (stripeSubscriptionId) {
          const [existing] = await db
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
            .limit(1);
          // Distribute revenue for the period that just ended, using the
          // subscription row's CURRENT (pre-update) period bounds — this
          // handler runs before upsertSubscriptionFromStripe/
          // customer.subscription.updated has a chance to roll the row
          // forward to the new period, and does not depend on Stripe
          // webhook delivery ordering or on parsing period fields off the
          // Invoice object, which differ across API versions.
          if (existing && (existing.type === "platform" || existing.type === "publication") && invoice.amount_paid != null) {
            await distributePooledSubscriptionRevenue(existing, invoice.amount_paid);
          }
        }
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const stripeSubscription = event.data.object as Stripe.Subscription;
      const [existing] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.stripeSubscriptionId, stripeSubscription.id))
        .limit(1);
      // A subscription we ourselves cancelled via the supersede logic
      // above is already marked "superseded" — the resulting
      // customer.subscription.deleted webhook must not downgrade that
      // back to a plain "cancelled", which would lose the distinction
      // between "the reader cancelled this" and "this was replaced by
      // a Platform subscription."
      if (existing && existing.status !== "superseded") {
        const status =
          event.type === "customer.subscription.deleted" ? "cancelled" : statusFromStripe(stripeSubscription.status);
        const item = stripeSubscription.items.data[0];
        await db
          .update(subscriptions)
          .set({
            status,
            currentPeriodStart: new Date(item.current_period_start * 1000),
            currentPeriodEnd: new Date(item.current_period_end * 1000),
          })
          .where(eq(subscriptions.id, existing.id));
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
