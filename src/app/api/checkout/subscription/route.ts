import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { platformConfig, publications, subscriptions } from "../../../../../drizzle/schema/index";
import { requireAuth, UnauthenticatedError } from "@/lib/permissions";
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
    throw err;
  }

  const body = await request.json().catch(() => null);
  const parsed = subscriptionCheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
  }
  const { interval, type, publicationId } = parsed.data;

  const [config] = await db.select().from(platformConfig).limit(1);
  if (!config) {
    return NextResponse.json({ error: "Platform pricing is not configured." }, { status: 500 });
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

  const checkoutSession = await stripe.checkout.sessions.create({
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

  return NextResponse.json({ url: checkoutSession.url });
}
