import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { platformConfig } from "./schema/platformConfig";

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  const existing = await db.select().from(platformConfig).limit(1);
  if (existing.length > 0) {
    console.log("platformConfig already seeded, skipping.");
    return;
  }

  // Defaults per docs/00_ScopeDocument.md Section 5.1 and Section 6:
  // standalone 80/20, in-publication 60/20/20. Prices are placeholder
  // Phase-1 defaults, admin-editable via Step 11's fee config page.
  await db.insert(platformConfig).values({
    authorProMonthlyCents: 999,
    authorProYearlyCents: 9999,
    publicationSubMonthlyCents: 499,
    publicationSubYearlyCents: 4999,
    platformSubMonthlyCents: 1499,
    platformSubYearlyCents: 14999,
    payPerArticleMinCents: 99,
    payPerArticleMaxCents: 4999,
    standaloneAuthorSplitPct: 80,
    standalonePlatformSplitPct: 20,
    inPublicationAuthorSplitPct: 60,
    inPublicationOwnerSplitPct: 20,
    inPublicationPlatformSplitPct: 20,
  });

  console.log("Seeded platformConfig with Phase 1 defaults.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
