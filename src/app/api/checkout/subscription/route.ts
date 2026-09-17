import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { platformConfig, publications, subscriptions } from "../../../../../drizzle/schema/index";
import { requireAuth, UnauthenticatedError, SuspendedError } from "@/lib/permissions";
import { stripe } from "@/lib/stripe";
import { subscriptionCheckoutSchema } from "@/lib/validators/checkout";

export async function POST(request: Request) {
  let session;
  try {
    session = await requireAuth();
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ error: "You must be logged in to upgrade." }, { status: 401 });
    }
    if (err instanceof SuspendedError) {
      return NextResponse.json({ error: "Your account has been suspended." }, { status: 403 });
    }
    throw err;
  }

  const body = await request.json().catch(() => null);
  const parsed = subscriptionCheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
  }
  const { interval, type, publicationId } = parsed.data;

  // requireAuth() only confirms the caller is signed in and not
  // suspended — it does not check role. Without a role check here, the
  // page-level restriction on /dashboard/author/billing was the ONLY
  // thing stopping a Reader (not eligible to upgrade) or an Admin
  // (explicitly excluded, docs/00_ScopeDocument.md Section 3) from
  // calling this route directly and buying a subscription. Platform
  // and Publication subscriptions are Reader/Author/AuthorPro-buyable
  // per the matrix, but Admin is excluded from those too.
  if (type === "author_pro" && session.user.role !== "author") {
    return NextResponse.json(
      { error: "Only Authors can upgrade to AuthorPro." },
      { status: 403 }
    );
  }
  if ((type === "platform" || type === "publication") && session.user.role === "admin") {
    return NextResponse.json(
      { error: "Platform Admin accounts cannot purchase subscriptions." },
      { status: 403 }
    );
  }

  const [config] = await db.select().from(platformConfig).limit(1);
  if (!config) {
    return NextResponse.json({ error: "Platform pricing is not configured." }, { status: 500 });
  }

  // Guards against starting a second checkout for a subscription type
  // the user already has active (e.g. two browser tabs both open to
  // the same subscribe button) — the webhook handler only dedupes by
  // Stripe subscription ID, so two genuinely separate Stripe
  // subscriptions of the same type would otherwise both bill the user.
  // Platform-vs-Publication is intentionally NOT blocked here (per
  // upsertSubscriptionFromStripe's supersede logic in the webhook
  // handler, cross-subscribing is allowed and handled there).
  const activeSubs = await db
    .select({ type: subscriptions.type, publicationId: subscriptions.publicationId })
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, session.user.id), eq(subscriptions.status, "active")));

  const alreadyHasSameType =
    type === "publication"
      ? activeSubs.some((s) => s.type === "publication" && s.publicationId === publicationId)
      : activeSubs.some((s) => s.type === type);
  if (alreadyHasSameType) {
    return NextResponse.json(
      { error: "You already have an active subscription of this type." },
      { status: 409 }
    );
  }

  let amountCents: number;
  let productName: string;

  if (type === "author_pro") {
    amountCents = interval === "monthly" ? config.authorProMonthlyCents : config.authorProYearlyCents;
    productName = `AuthorPro (${interval})`;
  } else if (type === "platform") {
    amountCents = interval === "monthly" ? config.platformSubMonthlyCents : config.platformSubYearlyCents;
    productName = `Contributor Platform Subscription (${interval})`;
  } else {
    if (!publicationId) {
      return NextResponse.json({ error: "publicationId is required for a Publication subscription" }, { status: 400 });
    }
    const [publication] = await db.select().from(publications).where(eq(publications.id, publicationId)).limit(1);
    if (!publication) {
      return NextResponse.json({ error: "Publication not found" }, { status: 404 });
    }
    amountCents = interval === "monthly" ? config.publicationSubMonthlyCents : config.publicationSubYearlyCents;
    productName = `${publication.name} Subscription (${interval})`;
  }

  // Stripe rejects a $0 recurring price outright — updatePlatformConfigAction
  // blocks saving one, but this guards misconfigured/legacy data so
  // the failure is a clean message instead of an unhandled Stripe API
  // error surfacing as a raw 500.
  if (amountCents <= 0) {
    return NextResponse.json(
      { error: "This subscription isn't available for purchase right now. Please contact support." },
      { status: 500 }
    );
  }

  const [existingSub] = await db
    .select({ stripeCustomerId: subscriptions.stripeCustomerId })
    .from(subscriptions)
    .where(eq(subscriptions.userId, session.user.id))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);

  let customerId = existingSub?.stripeCustomerId ?? undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email ?? undefined,
      metadata: { userId: session.user.id },
    });
    customerId = customer.id;
  }

  const origin = new URL(request.url).origin;
  const returnPath = type === "author_pro" ? "/dashboard/author/billing" : "/dashboard/reader/subscriptions";

  let checkoutSession;
  try {
    checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: productName },
            unit_amount: amountCents,
            recurring: { interval: interval === "monthly" ? "month" : "year" },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.user.id,
        subscriptionType: type,
        billingInterval: interval,
        ...(type === "publication" && publicationId ? { publicationId } : {}),
      },
      success_url: `${origin}${returnPath}?success=true`,
      cancel_url: `${origin}${returnPath}?canceled=true`,
    });
  } catch (err) {
    console.error("Stripe checkout session creation failed:", err);
    return NextResponse.json(
      { error: "Couldn't start checkout right now. Please try again in a moment." },
      { status: 502 }
    );
  }

  return NextResponse.json({ url: checkoutSession.url });
}
