import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { purchases, subscriptions } from "../../../../../drizzle/schema/index";
import { stripe } from "@/lib/stripe";
import { calculateAndRecordSplit } from "@/lib/revenue-split";

function statusFromStripe(status: Stripe.Subscription.Status): "active" | "cancelled" | "past_due" {
  if (status === "active" || status === "trialing") return "active";
  if (status === "past_due" || status === "unpaid") return "past_due";
  return "cancelled";
}

async function upsertSubscriptionFromStripe(
  stripeSubscription: Stripe.Subscription,
  userId: string
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

  await db.insert(subscriptions).values({
    userId,
    type: "author_pro",
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
      if (checkoutSession.mode === "subscription" && checkoutSession.metadata?.subscriptionType === "author_pro") {
        const userId = checkoutSession.metadata.userId;
        const stripeSubscriptionId =
          typeof checkoutSession.subscription === "string" ? checkoutSession.subscription : checkoutSession.subscription?.id;
        if (userId && stripeSubscriptionId) {
          const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
          await upsertSubscriptionFromStripe(stripeSubscription, userId);
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
      if (existing) {
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
