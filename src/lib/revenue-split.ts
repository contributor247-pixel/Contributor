import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { articles, ledger, platformConfig } from "../../drizzle/schema/index";

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
  sourceId: string
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
