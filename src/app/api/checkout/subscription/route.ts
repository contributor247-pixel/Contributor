import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { platformConfig, subscriptions } from "../../../../../drizzle/schema/index";
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
  const { interval } = parsed.data;

  const [config] = await db.select().from(platformConfig).limit(1);
  if (!config) {
    return NextResponse.json({ error: "Platform pricing is not configured." }, { status: 500 });
  }
  const amountCents = interval === "monthly" ? config.authorProMonthlyCents : config.authorProYearlyCents;

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

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: `AuthorPro (${interval})` },
          unit_amount: amountCents,
          recurring: { interval: interval === "monthly" ? "month" : "year" },
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId: session.user.id,
      subscriptionType: "author_pro",
      billingInterval: interval,
    },
    success_url: `${origin}/dashboard/author/billing?success=true`,
    cancel_url: `${origin}/dashboard/author/billing?canceled=true`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
