import { pgTable, uuid, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";
import { articles } from "./articles";

export const reportReasonEnum = pgEnum("report_reason", [
  "spam",
  "harassment",
  "copyright",
  "misinformation",
  "other",
]);

export const reportStatusEnum = pgEnum("report_status", [
  "open",
  "dismissed",
  "actioned",
]);

export const reportActionEnum = pgEnum("report_action", [
  "dismissed",
  "unpublished",
  "author_suspended",
]);

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  articleId: uuid("article_id")
    .notNull()
    .references(() => articles.id),
  reportedByUserId: uuid("reported_by_user_id")
    .notNull()
    .references(() => users.id),
  reason: reportReasonEnum("reason").notNull(),
  status: reportStatusEnum("status").notNull().default("open"),
  adminActionTaken: reportActionEnum("admin_action_taken"),
  actionedByUserId: uuid("actioned_by_user_id").references(() => users.id),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  actionedAt: timestamp("actioned_at", { mode: "date" }),
});
