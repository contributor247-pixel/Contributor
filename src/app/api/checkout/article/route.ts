import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { articles, purchases } from "../../../../../drizzle/schema/index";
import { requireAuth, UnauthenticatedError } from "@/lib/permissions";
import { stripe } from "@/lib/stripe";

const bodySchema = z.object({ articleId: z.string().uuid() });

export async function POST(request: Request) {
  let session;
  try {
    session = await requireAuth();
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ error: "You must be logged in to purchase an article." }, { status: 401 });
    }
    throw err;
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const [article] = await db
    .select()
    .from(articles)
    .where(eq(articles.id, parsed.data.articleId))
    .limit(1);
  if (!article || !article.isPremium || !article.priceCents || article.status !== "published") {
    return NextResponse.json({ error: "This article is not available for purchase." }, { status: 400 });
  }

  const [existingPurchase] = await db
    .select({ id: purchases.id })
    .from(purchases)
    .where(and(eq(purchases.articleId, article.id), eq(purchases.userId, session.user.id)))
    .limit(1);
  if (existingPurchase) {
    return NextResponse.json({ error: "You already own this article." }, { status: 409 });
  }

  const origin = new URL(request.url).origin;

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: session.user.email ?? undefined,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: article.title },
          unit_amount: article.priceCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      articleId: article.id,
      userId: session.user.id,
      purchaseType: "article",
    },
    success_url: `${origin}/article/${article.slug}?purchased=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/article/${article.slug}?canceled=true`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
