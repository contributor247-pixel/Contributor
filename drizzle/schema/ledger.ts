import {
  pgTable,
  uuid,
  integer,
  jsonb,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { articles } from "./articles";
import { users } from "./users";

export const ledgerSourceTypeEnum = pgEnum("ledger_source_type", [
  "purchase",
  "publication_subscription",
  "platform_subscription",
]);

export const ledgerPayoutStatusEnum = pgEnum("ledger_payout_status", [
  "pending",
  "paid",
]);

export const ledger = pgTable("ledger", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Nullable: a platform-subscription period with zero qualifying reads
  // still writes a ledger row (100% to Platform) with articleId = null.
  articleId: uuid("article_id").references(() => articles.id),
  sourceType: ledgerSourceTypeEnum("source_type").notNull(),
  // The purchases.id or subscriptions.id this entry originated from.
  sourceId: uuid("source_id").notNull(),
  // The Reader who paid — docs/00_ScopeDocument.md Section 5.3 lists
  // "payer (reader) id" as a required ledger field in its own right,
  // not just derivable by joining through sourceId. Stored directly so
  // the ledger stays a self-contained system of record even if the
  // originating purchase/subscription row is later deleted or the join
  // path changes.
  payerId: uuid("payer_id").notNull().references(() => users.id),
  grossAmountCents: integer("gross_amount_cents").notNull(),
  platformCents: integer("platform_cents").notNull(),
  authorCents: integer("author_cents").notNull().default(0),
  publicationOwnerCents: integer("publication_owner_cents"),
  splitPercentagesUsed: jsonb("split_percentages_used").notNull(),
  payoutStatus: ledgerPayoutStatusEnum("payout_status").notNull().default("pending"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});
