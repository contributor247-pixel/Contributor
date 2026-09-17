import { relations } from "drizzle-orm";
import { users, userRoleEnum, userStatusEnum } from "./users";
import { accounts, sessions, verificationTokens } from "./auth";
import { categories } from "./categories";
import { tags } from "./tags";
import {
  articles,
  articleAuthors,
  articleTags,
  articleStatusEnum,
} from "./articles";
import { publications } from "./publications";
import { invites, inviteStatusEnum } from "./invites";
import {
  subscriptions,
  subscriptionTypeEnum,
  subscriptionStatusEnum,
  billingIntervalEnum,
} from "./subscriptions";
import { purchases } from "./purchases";
import { readEvents } from "./readEvents";
import {
  ledger,
  ledgerSourceTypeEnum,
  ledgerPayoutStatusEnum,
} from "./ledger";
import {
  reports,
  reportReasonEnum,
  reportStatusEnum,
  reportActionEnum,
} from "./reports";
import { comments } from "./comments";
import { otpCodes } from "./otpCodes";
import { notifications, notificationTypeEnum } from "./notifications";
import { platformConfig } from "./platformConfig";
import { autoLoginTokens } from "./autoLoginTokens";
import { processedWebhookEvents } from "./processedWebhookEvents";

// Re-export every table/enum by name explicitly. Deliberately NOT using
// `export * from "./x"` here: under tsx's ESM transform, `export *` of a
// module exporting a Drizzle `pgTable` silently resolves to `undefined`
// for every consumer of this barrel (verified independent of this
// project's own code — Next.js's own bundler is unaffected, but any
// tsx/ts-node-run script, including drizzle-kit tooling, is not).
// Explicit named re-exports below sidestep that bug entirely.
export {
  users,
  userRoleEnum,
  userStatusEnum,
  accounts,
  sessions,
  verificationTokens,
  categories,
  tags,
  articles,
  articleAuthors,
  articleTags,
  articleStatusEnum,
  publications,
  invites,
  inviteStatusEnum,
  subscriptions,
  subscriptionTypeEnum,
  subscriptionStatusEnum,
  billingIntervalEnum,
  purchases,
  readEvents,
  ledger,
  ledgerSourceTypeEnum,
  ledgerPayoutStatusEnum,
  reports,
  reportReasonEnum,
  reportStatusEnum,
  reportActionEnum,
  comments,
  otpCodes,
  notifications,
  notificationTypeEnum,
  platformConfig,
  autoLoginTokens,
  processedWebhookEvents,
};

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  articleAuthors: many(articleAuthors),
  ownedPublications: many(publications),
  subscriptions: many(subscriptions),
  purchases: many(purchases),
  reports: many(reports),
  comments: many(comments),
  otpCodes: many(otpCodes),
  notifications: many(notifications),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  articles: many(articles),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  articleTags: many(articleTags),
}));

export const publicationsRelations = relations(publications, ({ one, many }) => ({
  owner: one(users, { fields: [publications.ownerId], references: [users.id] }),
  articles: many(articles),
  invites: many(invites),
  subscriptions: many(subscriptions),
}));

export const articlesRelations = relations(articles, ({ one, many }) => ({
  category: one(categories, { fields: [articles.categoryId], references: [categories.id] }),
  publication: one(publications, { fields: [articles.publicationId], references: [publications.id] }),
  articleAuthors: many(articleAuthors),
  articleTags: many(articleTags),
  purchases: many(purchases),
  readEvents: many(readEvents),
  ledgerEntries: many(ledger),
  reports: many(reports),
  comments: many(comments),
}));

export const articleAuthorsRelations = relations(articleAuthors, ({ one }) => ({
  article: one(articles, { fields: [articleAuthors.articleId], references: [articles.id] }),
  user: one(users, { fields: [articleAuthors.userId], references: [users.id] }),
}));

export const articleTagsRelations = relations(articleTags, ({ one }) => ({
  article: one(articles, { fields: [articleTags.articleId], references: [articles.id] }),
  tag: one(tags, { fields: [articleTags.tagId], references: [tags.id] }),
}));

export const invitesRelations = relations(invites, ({ one }) => ({
  publication: one(publications, { fields: [invites.publicationId], references: [publications.id] }),
  invitedUser: one(users, { fields: [invites.invitedUserId], references: [users.id] }),
  invitedByUser: one(users, { fields: [invites.invitedByUserId], references: [users.id] }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
  publication: one(publications, { fields: [subscriptions.publicationId], references: [publications.id] }),
}));

export const purchasesRelations = relations(purchases, ({ one }) => ({
  user: one(users, { fields: [purchases.userId], references: [users.id] }),
  article: one(articles, { fields: [purchases.articleId], references: [articles.id] }),
}));

export const readEventsRelations = relations(readEvents, ({ one }) => ({
  user: one(users, { fields: [readEvents.userId], references: [users.id] }),
  article: one(articles, { fields: [readEvents.articleId], references: [articles.id] }),
}));

export const ledgerRelations = relations(ledger, ({ one }) => ({
  article: one(articles, { fields: [ledger.articleId], references: [articles.id] }),
  payer: one(users, { fields: [ledger.payerId], references: [users.id] }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  article: one(articles, { fields: [reports.articleId], references: [articles.id] }),
  reportedByUser: one(users, { fields: [reports.reportedByUserId], references: [users.id] }),
  actionedByUser: one(users, { fields: [reports.actionedByUserId], references: [users.id] }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  article: one(articles, { fields: [comments.articleId], references: [articles.id] }),
  user: one(users, { fields: [comments.userId], references: [users.id] }),
}));

export const otpCodesRelations = relations(otpCodes, ({ one }) => ({
  user: one(users, { fields: [otpCodes.userId], references: [users.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));
