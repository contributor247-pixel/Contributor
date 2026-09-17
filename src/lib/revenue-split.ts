import { and, eq, gte, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { articles, ledger, platformConfig, readEvents } from "../../drizzle/schema/index";
import type { subscriptions } from "../../drizzle/schema/subscriptions";

type SubscriptionRow = typeof subscriptions.$inferSelect;

type LedgerSourceType = "purchase" | "publication_subscription" | "platform_subscription";

// Splits gross cents by integer percentages, giving any leftover
// remainder cent(s) to the platform's share so the parts always sum
// exactly to the gross — never floats, per
// docs/00_ScopeDocument.md Section 5.1's integer-cents requirement.
function splitCents(grossCents: number, sharePcts: Record<string, number>): Record<string, number> {
  const keys = Object.keys(sharePcts);
  const shares: Record<string, number> = {};
  let allocated = 0;
  for (const key of keys) {
    const cents = Math.floor((grossCents * sharePcts[key]) / 100);
    shares[key] = cents;
    allocated += cents;
  }
  const remainder = grossCents - allocated;
  shares.platform = (shares.platform ?? 0) + remainder;
  return shares;
}

export async function calculateAndRecordSplit(
  articleId: string,
  grossAmountCents: number,
  sourceType: LedgerSourceType,
  sourceId: string,
  payerId: string
): Promise<void> {
  const [config] = await db.select().from(platformConfig).limit(1);
  if (!config) throw new Error("platformConfig is not seeded");

  const [article] = await db.select({ publicationId: articles.publicationId }).from(articles).where(eq(articles.id, articleId)).limit(1);
  if (!article) throw new Error(`Article ${articleId} not found`);

  const isInPublication = article.publicationId !== null;

  if (isInPublication) {
    const shares = splitCents(grossAmountCents, {
      author: config.inPublicationAuthorSplitPct,
      owner: config.inPublicationOwnerSplitPct,
      platform: config.inPublicationPlatformSplitPct,
    });
    await db.insert(ledger).values({
      articleId,
      sourceType,
      sourceId,
      payerId,
      grossAmountCents,
      authorCents: shares.author,
      publicationOwnerCents: shares.owner,
      platformCents: shares.platform,
      splitPercentagesUsed: {
        author: config.inPublicationAuthorSplitPct,
        owner: config.inPublicationOwnerSplitPct,
        platform: config.inPublicationPlatformSplitPct,
      },
      payoutStatus: "pending",
    });
  } else {
    const shares = splitCents(grossAmountCents, {
      author: config.standaloneAuthorSplitPct,
      platform: config.standalonePlatformSplitPct,
    });
    await db.insert(ledger).values({
      articleId,
      sourceType,
      sourceId,
      payerId,
      grossAmountCents,
      authorCents: shares.author,
      publicationOwnerCents: null,
      platformCents: shares.platform,
      splitPercentagesUsed: {
        author: config.standaloneAuthorSplitPct,
        platform: config.standalonePlatformSplitPct,
      },
      payoutStatus: "pending",
    });
  }

  // TODO(Phase 2): the ledger row above records payout obligations as
  // payoutStatus="pending" only — no real money moves yet. Wiring an
  // actual Stripe Connect transfer to the author's (and, for
  // in-publication articles, the Publication owner's) connected
  // account happens per docs/00_ScopeDocument.md Section 5.3 and
  // Section 11, once Connect onboarding exists.
}

// Logs a qualifying read of a Premium article by a Reader with
// subscription-based access (Platform or Publication) — NOT for
// one-off purchases, which are already fully attributed at purchase
// time via calculateAndRecordSplit. Deduplicated per
// docs/00_ScopeDocument.md Section 5.2's (userId, articleId,
// billingPeriodStart) uniqueness rule via onConflictDoNothing, so a
// re-read within the same billing period never double-counts.
export async function logQualifyingRead(
  userId: string,
  articleId: string,
  billingPeriodStart: Date
): Promise<void> {
  await db
    .insert(readEvents)
    .values({ userId, articleId, billingPeriodStart })
    .onConflictDoNothing({ target: [readEvents.userId, readEvents.articleId, readEvents.billingPeriodStart] });
}

// Distributes a Platform or Publication subscription's just-paid
// invoice across the distinct Premium articles the subscriber read
// during the period that just ended, per
// docs/00_ScopeDocument.md Section 5.2. Called from the
// invoice.payment_succeeded webhook with the subscription row's
// CURRENT (pre-renewal-update) currentPeriodStart, which is exactly
// the period this payment closes out.
//
// Rounding-remainder handling: the gross amount is divided evenly
// across the distinct articles read (integer division), and whatever
// remainder cents are left over from that division are added to the
// FIRST article encountered (ordered by earliest read within the
// period) — documented here per the guide's explicit instruction to
// pick and document a remainder rule. That per-article amount then
// runs through the same standalone/in-publication percentage split
// as a direct purchase, via calculateAndRecordSplit.
//
// Publication-scoped pooling choice: a Publication subscription only
// ever grants access to ONE Publication's content, so its pooling is
// implemented as "pooled across only that Publication's distinct
// articles read in the period" — the simpler of the two spec-compliant
// options the guide offers, chosen because a Publication subscriber
// structurally cannot have read qualifying articles outside that one
// Publication, making the two options equivalent in practice for this
// subscription type while the simpler one needs no extra scoping code.
export async function distributePooledSubscriptionRevenue(
  subscription: SubscriptionRow,
  grossAmountCents: number
): Promise<void> {
  const periodStart = subscription.currentPeriodStart;
  const periodEnd = subscription.currentPeriodEnd;

  const readRows = await db
    .select({ articleId: readEvents.articleId, createdAt: readEvents.createdAt })
    .from(readEvents)
    .where(
      and(
        eq(readEvents.userId, subscription.userId),
        gte(readEvents.billingPeriodStart, periodStart),
        lt(readEvents.billingPeriodStart, periodEnd)
      )
    );

  const distinctArticleIds = [...new Set(readRows.map((r) => r.articleId))];

  if (distinctArticleIds.length === 0) {
    // No qualifying reads this period — the full amount is recorded as
    // 100% Platform revenue with no article to attribute it to, per
    // the guide's explicit instruction for this case.
    await db.insert(ledger).values({
      articleId: null,
      sourceType: subscription.type === "platform" ? "platform_subscription" : "publication_subscription",
      sourceId: subscription.id,
      payerId: subscription.userId,
      grossAmountCents,
      authorCents: 0,
      publicationOwnerCents: null,
      platformCents: grossAmountCents,
      splitPercentagesUsed: { platform: 100, note: "no qualifying reads this billing period" },
      payoutStatus: "pending",
    });
    return;
  }

  // Order by earliest read so the remainder cent(s) go to the first
  // article encountered, per the rounding rule documented above.
  const firstReadAtByArticle = new Map<string, Date>();
  for (const row of readRows) {
    const existing = firstReadAtByArticle.get(row.articleId);
    if (!existing || row.createdAt < existing) firstReadAtByArticle.set(row.articleId, row.createdAt);
  }
  const orderedArticleIds = distinctArticleIds.sort(
    (a, b) => firstReadAtByArticle.get(a)!.getTime() - firstReadAtByArticle.get(b)!.getTime()
  );

  const baseShare = Math.floor(grossAmountCents / orderedArticleIds.length);
  const remainder = grossAmountCents - baseShare * orderedArticleIds.length;

  const sourceType: LedgerSourceType = subscription.type === "platform" ? "platform_subscription" : "publication_subscription";

  // Scalability note: each call does 2 SELECTs + 1 INSERT of its own,
  // fully independent of every other article's split (own article
  // lookup, own ledger row, no shared state or ordering dependency
  // between iterations) — previously run sequentially, which meant a
  // subscriber who read N distinct articles in a billing period cost
  // this one webhook handler N round-trips in series. Under this
  // project's documented Neon latency (a single round-trip has been
  // observed taking multiple seconds during a connectivity blip),
  // that scales linearly and badly; running them concurrently doesn't
  // reduce the total DB work but removes the serial-latency
  // multiplication.
  await Promise.all(
    orderedArticleIds.map((articleId, i) => {
      const amountForArticle = i === 0 ? baseShare + remainder : baseShare;
      return calculateAndRecordSplit(articleId, amountForArticle, sourceType, subscription.id, subscription.userId);
    })
  );
}
