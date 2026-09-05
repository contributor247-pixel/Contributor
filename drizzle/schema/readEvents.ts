import { pgTable, uuid, date, timestamp, unique } from "drizzle-orm/pg-core";
import { users } from "./users";
import { articles } from "./articles";

// Unique (userId, articleId, billingPeriodStart) enforces "one qualifying
// read per reader per article per billing period" per
// docs/00_ScopeDocument.md Section 5.2.
export const readEvents = pgTable(
  "read_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id),
    billingPeriodStart: date("billing_period_start", { mode: "date" }).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.userId, t.articleId, t.billingPeriodStart)]
);
