"use server";

import { and, count, desc, eq, gte, inArray, sql as rawSql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  articles,
  articleAuthors,
  ledger,
  purchases,
  subscriptions,
} from "../../../drizzle/schema/index";
import { requireVerifiedAuthor, requireAuth } from "@/lib/permissions";

export async function getAuthorOverviewStats() {
  const session = await requireVerifiedAuthor();

  const myArticleRows = await db
    .select({ articleId: articleAuthors.articleId })
    .from(articleAuthors)
    .where(eq(articleAuthors.userId, session.user.id));
  const myArticleIds = myArticleRows.map((r) => r.articleId);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [[publishedCount], [revenueRow]] = await Promise.all([
    myArticleIds.length > 0
      ? db
          .select({ value: count() })
          .from(articles)
          .where(and(inArray(articles.id, myArticleIds), eq(articles.status, "published")))
      : Promise.resolve([{ value: 0 }]),
    myArticleIds.length > 0
      ? db
          .select({ value: rawSql<number>`coalesce(sum(${ledger.authorCents}), 0)` })
          .from(ledger)
          .where(and(inArray(ledger.articleId, myArticleIds), gte(ledger.createdAt, startOfMonth)))
      : Promise.resolve([{ value: 0 }]),
  ]);

  const [authorProSub] = await db
    .select({ status: subscriptions.status })
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, session.user.id), eq(subscriptions.type, "author_pro"), eq(subscriptions.status, "active")))
    .limit(1);

  return {
    totalArticles: myArticleIds.length,
    publishedArticles: publishedCount.value,
    revenueThisMonthCents: Number(revenueRow.value),
    isAuthorPro: !!authorProSub,
  };
}

export async function getReaderOverviewStats(userId?: string) {
  let effectiveUserId = userId;
  if (!effectiveUserId) {
    try {
      const session = await requireAuth();
      effectiveUserId = session.user.id;
    } catch {
      return { totalPurchases: 0, activeSubscriptions: 0 };
    }
  }

  try {
    const [[purchaseCount], [activeSubCount]] = await Promise.all([
      db.select({ value: count() }).from(purchases).where(eq(purchases.userId, effectiveUserId)),
      db
        .select({ value: count() })
        .from(subscriptions)
        .where(and(eq(subscriptions.userId, effectiveUserId), eq(subscriptions.status, "active"))),
    ]);

    return {
      totalPurchases: Number(purchaseCount?.value ?? 0),
      activeSubscriptions: Number(activeSubCount?.value ?? 0),
    };
  } catch (err) {
    console.error("Failed to load reader overview stats:", err);
    return { totalPurchases: 0, activeSubscriptions: 0 };
  }
}

export async function getMyPurchasesAction() {
  const session = await requireAuth();

  return db
    .select({
      id: purchases.id,
      amountCents: purchases.amountCents,
      createdAt: purchases.createdAt,
      articleTitle: articles.title,
      articleSlug: articles.slug,
    })
    .from(purchases)
    .innerJoin(articles, eq(purchases.articleId, articles.id))
    .where(eq(purchases.userId, session.user.id))
    .orderBy(desc(purchases.createdAt));
}
