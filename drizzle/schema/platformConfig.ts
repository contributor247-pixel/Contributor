import { pgTable, uuid, integer, timestamp } from "drizzle-orm/pg-core";

// Single-row admin-editable fee/config table. Seeded to
// docs/00_ScopeDocument.md Section 5.1/6 defaults (80/20 standalone,
// 60/20/20 in-publication) by drizzle/seed.ts.
export const platformConfig = pgTable("platform_config", {
  id: uuid("id").primaryKey().defaultRandom(),
  authorProMonthlyCents: integer("author_pro_monthly_cents").notNull(),
  authorProYearlyCents: integer("author_pro_yearly_cents").notNull(),
  publicationSubMonthlyCents: integer("publication_sub_monthly_cents").notNull(),
  publicationSubYearlyCents: integer("publication_sub_yearly_cents").notNull(),
  platformSubMonthlyCents: integer("platform_sub_monthly_cents").notNull(),
  platformSubYearlyCents: integer("platform_sub_yearly_cents").notNull(),
  payPerArticleMinCents: integer("pay_per_article_min_cents").notNull(),
  payPerArticleMaxCents: integer("pay_per_article_max_cents").notNull(),
  standaloneAuthorSplitPct: integer("standalone_author_split_pct").notNull(),
  standalonePlatformSplitPct: integer("standalone_platform_split_pct").notNull(),
  inPublicationAuthorSplitPct: integer("in_publication_author_split_pct").notNull(),
  inPublicationOwnerSplitPct: integer("in_publication_owner_split_pct").notNull(),
  inPublicationPlatformSplitPct: integer("in_publication_platform_split_pct").notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});
