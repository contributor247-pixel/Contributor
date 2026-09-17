import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { articles, purchases } from "../../../../../drizzle/schema/index";
import { requireAuth, UnauthenticatedError, SuspendedError, hasArticleAccess } from "@/lib/permissions";
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
    if (err instanceof SuspendedError) {
      return NextResponse.json({ error: "Your account has been suspended." }, { status: 403 });
    }
    throw err;
  }

  // Reader/Author/AuthorPro can all buy an article "as a reader" per
  // docs/00_ScopeDocument.md Section 3, but Platform Admin is excluded
  // — requireAuth() alone doesn't check role, only that the caller is
  // signed in and not suspended.
  if (session.user.role === "admin") {
    return NextResponse.json(
      { error: "Platform Admin accounts cannot purchase articles." },
      { status: 403 }
    );
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

  // A Platform or Publication subscriber already has full read access
  // via getArticleAccessSource — without this check they could still
  // hit this endpoint (e.g. a stale paywall render, or a direct
  // request) and pay for an article they can already read for free.
  if (await hasArticleAccess(session.user.id, article)) {
    return NextResponse.json(
      { error: "You already have access to this article through your subscription." },
      { status: 409 }
    );
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
