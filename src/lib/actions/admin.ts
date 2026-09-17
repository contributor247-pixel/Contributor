"use server";

import { and, count, desc, eq, gte, ilike, ne, or, sql as rawSql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { render } from "@react-email/components";
import { db } from "@/lib/db";
import {
  users,
  reports,
  articles,
  articleAuthors,
  categories,
  platformConfig,
  ledger,
  notifications,
  subscriptions,
} from "../../../drizzle/schema/index";
import { requireRole } from "@/lib/permissions";
import { mailer } from "@/lib/mailer";
import { ModerationNoticeEmail } from "@/emails/moderation-notice";

const DASHBOARD_BASE_URL = process.env.AUTH_URL ?? "http://localhost:3000";

async function notifyModerationAction(params: {
  authorUserId: string;
  action: "unpublished" | "author_suspended";
  articleTitle?: string;
  reason: string;
}) {
  const [author] = await db.select().from(users).where(eq(users.id, params.authorUserId)).limit(1);
  if (!author) return;

  await db.insert(notifications).values({
    userId: params.authorUserId,
    type: "moderation_action",
    message:
      params.action === "unpublished"
        ? `Your article "${params.articleTitle}" was unpublished by a moderator.`
        : "Your account was suspended by a moderator.",
    linkUrl: params.action === "unpublished" ? "/dashboard/author/articles" : "/dashboard/author/settings",
  });

  try {
    const html = await render(
      ModerationNoticeEmail({
        recipientName: author.name ?? "",
        action: params.action,
        articleTitle: params.articleTitle,
        reason: params.reason,
        dashboardUrl: `${DASHBOARD_BASE_URL}/dashboard/author`,
      })
    );
    const { error } = await mailer.emails.send({
      from: process.env.EMAIL_FROM ?? "Contributor <onboarding@contributor.app>",
      to: author.email,
      subject:
        params.action === "unpublished" ? "One of your articles was unpublished" : "Your Contributor account has been suspended",
      html,
    });
    if (error) {
      console.error("Failed to send moderation notice email:", error.message);
    }
  } catch (err) {
    console.error("Failed to send moderation notice email:", err);
  }
}

export type AdminActionResult = { success: true } | { success: false; error: string };

// ---- Overview stats (11.1) ----

export async function getAdminOverviewStats() {
  await requireRole("admin");

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [[userCount], [articleCount], [openReportCount], [revenueRow]] = await Promise.all([
    db.select({ value: count() }).from(users),
    db.select({ value: count() }).from(articles).where(eq(articles.status, "published")),
    db.select({ value: count() }).from(reports).where(eq(reports.status, "open")),
    db
      .select({ value: rawSql<number>`coalesce(sum(${ledger.grossAmountCents}), 0)` })
      .from(ledger)
      .where(gte(ledger.createdAt, startOfMonth)),
  ]);

  return {
    totalUsers: userCount.value,
    totalPublishedArticles: articleCount.value,
    openReports: openReportCount.value,
    revenueThisMonthCents: Number(revenueRow.value),
  };
}

// ---- Users (11.2) ----

export async function getAdminUsers(page: number, perPage: number, search?: string) {
  await requireRole("admin");

  const trimmed = search?.trim();
  const where = trimmed
    ? or(ilike(users.email, `%${trimmed}%`), ilike(users.name, `%${trimmed}%`))
    : undefined;

  const [{ value: totalCount }] = await db.select({ value: count() }).from(users).where(where);

  // isAuthorPro: an EXISTS subquery against a live, non-expired
  // author_pro subscription row — the same active/currentPeriodEnd
  // criteria requireAuthorPro() uses everywhere else (permissions.ts),
  // so this list matches what actually gates Premium/Publication
  // actions rather than a stale/cached notion of "Pro." A user can
  // have multiple historical subscription rows (past cancellations,
  // renewals), so this is an existence check, not a join that could
  // multiply/duplicate user rows.
  //
  // The outer table is referenced as the literal "users"."id" rather
  // than via ${users.id} — inside this raw subquery template, Drizzle
  // renders ${users.id} as the bare unqualified column "id" (no table
  // prefix), which inside "SELECT 1 FROM subscriptions ..." resolves
  // against subscriptions, not the outer users row, silently breaking
  // the correlation so isAuthorPro always evaluated false regardless
  // of real subscription data (confirmed by hand: a user with a real
  // active, far-future-expiring subscription still came back false;
  // switching to the literal-quoted table.column reference fixed it —
  // verified the same case then correctly returns true). A JS Date is
  // still bound as a parameter for currentPeriodEnd rather than SQL's
  // now(), consistent with how the rest of the codebase does this
  // comparison (see requireAuthorPro in permissions.ts).
  const nowParam = new Date();
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt,
      isAuthorPro: rawSql<boolean>`EXISTS (
        SELECT 1 FROM ${subscriptions}
        WHERE ${subscriptions.userId} = "users"."id"
          AND ${subscriptions.type} = 'author_pro'
          AND ${subscriptions.status} = 'active'
          AND ${subscriptions.currentPeriodEnd} > ${nowParam}
      )`,
    })
    .from(users)
    .where(where)
    .orderBy(desc(users.createdAt))
    .limit(perPage)
    .offset((page - 1) * perPage);

  return { items: rows, totalCount };
}

export async function verifyUserEmailAction(userId: string): Promise<AdminActionResult> {
  const session = await requireRole("admin");
  if (session.user.id === userId) return { success: false, error: "You cannot modify your own account here." };

  await db.update(users).set({ emailVerified: new Date(), updatedAt: new Date() }).where(eq(users.id, userId));
  revalidatePath("/dashboard/admin/users");
  return { success: true };
}

export async function setUserStatusAction(
  userId: string,
  status: "active" | "suspended"
): Promise<AdminActionResult> {
  const session = await requireRole("admin");
  if (session.user.id === userId) return { success: false, error: "You cannot suspend your own account." };

  const [target] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1);
  if (!target) return { success: false, error: "User not found." };
  if (target.role === "admin") return { success: false, error: "Admin accounts cannot be suspended here." };

  await db.update(users).set({ status, updatedAt: new Date() }).where(eq(users.id, userId));
  revalidatePath("/dashboard/admin/users");
  revalidatePath("/", "layout");
  return { success: true };
}

// ---- Moderation (11.3) ----

// Naturally self-limiting in the common case (open reports get
// resolved), but genuinely unbounded — no cap at all previously. A
// real backlog or an abuse spike outpacing admin review would still
// load every open report in one request. This limit is a stopgap so
// the page can't grow without bound; a real "load more"/paginated
// queue is the proper fix if the count regularly approaches this.
const MODERATION_QUEUE_LIMIT = 200;

export async function getModerationQueue() {
  await requireRole("admin");

  const rows = await db
    .select({
      id: reports.id,
      reason: reports.reason,
      detail: reports.detail,
      createdAt: reports.createdAt,
      articleId: articles.id,
      articleTitle: articles.title,
      articleSlug: articles.slug,
      reporterName: users.name,
      reporterEmail: users.email,
    })
    .from(reports)
    .innerJoin(articles, eq(reports.articleId, articles.id))
    .innerJoin(users, eq(reports.reportedByUserId, users.id))
    .where(eq(reports.status, "open"))
    .orderBy(desc(reports.createdAt))
    .limit(MODERATION_QUEUE_LIMIT);

  return rows;
}

export async function getReportDetail(reportId: string) {
  await requireRole("admin");

  const [row] = await db
    .select({
      id: reports.id,
      reason: reports.reason,
      detail: reports.detail,
      status: reports.status,
      adminActionTaken: reports.adminActionTaken,
      actionedAt: reports.actionedAt,
      createdAt: reports.createdAt,
      articleId: articles.id,
      articleTitle: articles.title,
      articleSlug: articles.slug,
      articleBody: articles.body,
      articleStatus: articles.status,
      reporterName: users.name,
      reporterEmail: users.email,
    })
    .from(reports)
    .innerJoin(articles, eq(reports.articleId, articles.id))
    .innerJoin(users, eq(reports.reportedByUserId, users.id))
    .where(eq(reports.id, reportId))
    .limit(1);

  if (!row) return null;

  const authorRows = await db
    .select({ userId: articleAuthors.userId, isPrimary: articleAuthors.isPrimary, name: users.name })
    .from(articleAuthors)
    .innerJoin(users, eq(articleAuthors.userId, users.id))
    .where(eq(articleAuthors.articleId, row.articleId));
  authorRows.sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));

  return { ...row, primaryAuthor: authorRows[0] ?? null };
}

export async function dismissReportAction(reportId: string): Promise<AdminActionResult> {
  const session = await requireRole("admin");

  // Atomic claim: the UPDATE's own WHERE status='open' is what actually
  // prevents a double-action, not a separate SELECT-then-check (which is
  // a check-then-write race — two admins' concurrent clicks, or one
  // admin's stale second tab, can both pass a plain SELECT check before
  // either has written). Whichever admin's UPDATE lands first flips the
  // status and its RETURNING gives back a row; a second concurrent call
  // finds zero matching rows (status is no longer 'open') and bails out
  // via claimed.length === 0, exactly like finding it already resolved.
  const claimed = await db
    .update(reports)
    .set({
      status: "dismissed",
      adminActionTaken: "dismissed",
      actionedByUserId: session.user.id,
      actionedAt: new Date(),
    })
    .where(and(eq(reports.id, reportId), eq(reports.status, "open")))
    .returning({ id: reports.id });
  if (claimed.length === 0) {
    const [existing] = await db.select({ id: reports.id }).from(reports).where(eq(reports.id, reportId)).limit(1);
    return { success: false, error: existing ? "This report has already been resolved." : "Report not found." };
  }

  revalidatePath("/dashboard/admin/moderation");
  return { success: true };
}

export async function unpublishArticleAction(reportId: string, articleId: string): Promise<AdminActionResult> {
  const session = await requireRole("admin");

  // Same atomic-claim pattern as dismissReportAction above — see that
  // comment for why this can't be a plain SELECT-then-check.
  const claimed = await db
    .update(reports)
    .set({
      status: "actioned",
      adminActionTaken: "unpublished",
      actionedByUserId: session.user.id,
      actionedAt: new Date(),
    })
    .where(and(eq(reports.id, reportId), eq(reports.status, "open")))
    .returning({ reason: reports.reason });
  if (claimed.length === 0) {
    const [existing] = await db.select({ id: reports.id }).from(reports).where(eq(reports.id, reportId)).limit(1);
    return { success: false, error: existing ? "This report has already been resolved." : "Report not found." };
  }
  const report = claimed[0];

  const [article] = await db.select({ title: articles.title }).from(articles).where(eq(articles.id, articleId)).limit(1);
  const [primaryAuthor] = await db
    .select({ userId: articleAuthors.userId })
    .from(articleAuthors)
    .where(and(eq(articleAuthors.articleId, articleId), eq(articleAuthors.isPrimary, true)))
    .limit(1);

  await db.update(articles).set({ status: "unpublished", updatedAt: new Date() }).where(eq(articles.id, articleId));

  if (primaryAuthor && article && report) {
    await notifyModerationAction({
      authorUserId: primaryAuthor.userId,
      action: "unpublished",
      articleTitle: article.title,
      reason: report.reason,
    });
  }

  revalidatePath("/dashboard/admin/moderation");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function suspendAuthorForReportAction(
  reportId: string,
  authorUserId: string
): Promise<AdminActionResult> {
  const session = await requireRole("admin");
  if (session.user.id === authorUserId) return { success: false, error: "You cannot suspend your own account." };

  const [target] = await db.select({ role: users.role }).from(users).where(eq(users.id, authorUserId)).limit(1);
  if (!target) return { success: false, error: "Author not found." };
  if (target.role === "admin") return { success: false, error: "Admin accounts cannot be suspended here." };

  // Same atomic-claim pattern as dismissReportAction above — see that
  // comment for why this can't be a plain SELECT-then-check.
  const claimed = await db
    .update(reports)
    .set({
      status: "actioned",
      adminActionTaken: "author_suspended",
      actionedByUserId: session.user.id,
      actionedAt: new Date(),
    })
    .where(and(eq(reports.id, reportId), eq(reports.status, "open")))
    .returning({ reason: reports.reason });
  if (claimed.length === 0) {
    const [existing] = await db.select({ id: reports.id }).from(reports).where(eq(reports.id, reportId)).limit(1);
    return { success: false, error: existing ? "This report has already been resolved." : "Report not found." };
  }
  const report = claimed[0];

  await db.update(users).set({ status: "suspended", updatedAt: new Date() }).where(eq(users.id, authorUserId));

  if (report) {
    await notifyModerationAction({
      authorUserId,
      action: "author_suspended",
      reason: report.reason,
    });
  }

  revalidatePath("/dashboard/admin/moderation");
  revalidatePath("/dashboard/admin/users");
  revalidatePath("/", "layout");
  return { success: true };
}

// ---- Categories (11.4) ----

export async function getAdminCategories() {
  await requireRole("admin");
  return db.select().from(categories).orderBy(categories.name);
}

export async function createCategoryAction(name: string): Promise<AdminActionResult> {
  await requireRole("admin");
  const trimmed = name.trim();
  if (!trimmed) return { success: false, error: "Category name is required." };

  const slug = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  if (!slug) return { success: false, error: "Category name must contain letters or numbers." };

  const [existing] = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, slug)).limit(1);
  if (existing) return { success: false, error: "A category with this name already exists." };

  await db.insert(categories).values({ name: trimmed, slug });
  revalidatePath("/dashboard/admin/settings/categories");
  return { success: true };
}

export async function renameCategoryAction(categoryId: string, name: string): Promise<AdminActionResult> {
  await requireRole("admin");
  const trimmed = name.trim();
  if (!trimmed) return { success: false, error: "Category name is required." };

  const [existing] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.name, trimmed))
    .limit(1);
  if (existing && existing.id !== categoryId) {
    return { success: false, error: "A category with this name already exists." };
  }

  await db.update(categories).set({ name: trimmed }).where(eq(categories.id, categoryId));
  revalidatePath("/dashboard/admin/settings/categories");
  return { success: true };
}

export async function setCategoryDeprecatedAction(categoryId: string, deprecated: boolean): Promise<AdminActionResult> {
  await requireRole("admin");
  await db.update(categories).set({ deprecated }).where(eq(categories.id, categoryId));
  revalidatePath("/dashboard/admin/settings/categories");
  return { success: true };
}

// ---- Fee config (11.5) ----

export async function getPlatformConfig() {
  await requireRole("admin");
  const [config] = await db.select().from(platformConfig).limit(1);
  return config ?? null;
}

export interface FeeConfigInput {
  authorProMonthlyCents: number;
  authorProYearlyCents: number;
  publicationSubMonthlyCents: number;
  publicationSubYearlyCents: number;
  platformSubMonthlyCents: number;
  platformSubYearlyCents: number;
  payPerArticleMinCents: number;
  payPerArticleMaxCents: number;
  payPerArticleDefaultCents: number;
  standaloneAuthorSplitPct: number;
  standalonePlatformSplitPct: number;
  inPublicationAuthorSplitPct: number;
  inPublicationOwnerSplitPct: number;
  inPublicationPlatformSplitPct: number;
}

export async function updatePlatformConfigAction(input: FeeConfigInput): Promise<AdminActionResult> {
  await requireRole("admin");

  for (const [key, value] of Object.entries(input)) {
    if (!Number.isInteger(value) || value < 0) {
      return { success: false, error: `${key} must be a non-negative whole number of cents/percent.` };
    }
  }
  // Stripe rejects a $0 recurring price outright — without this check
  // an admin could save a 0-cent subscription price here and every
  // checkout attempt for it would fail with an unhandled Stripe API
  // error instead of a clean message.
  const SUBSCRIPTION_PRICE_FIELDS: (keyof FeeConfigInput)[] = [
    "authorProMonthlyCents",
    "authorProYearlyCents",
    "publicationSubMonthlyCents",
    "publicationSubYearlyCents",
    "platformSubMonthlyCents",
    "platformSubYearlyCents",
  ];
  for (const key of SUBSCRIPTION_PRICE_FIELDS) {
    if (input[key] <= 0) {
      return { success: false, error: `${key} must be greater than $0.` };
    }
  }
  if (input.payPerArticleMinCents > input.payPerArticleMaxCents) {
    return { success: false, error: "Pay-per-article minimum cannot exceed the maximum." };
  }
  if (
    input.payPerArticleDefaultCents < input.payPerArticleMinCents ||
    input.payPerArticleDefaultCents > input.payPerArticleMaxCents
  ) {
    return { success: false, error: "Pay-per-article default must fall within the min/max range." };
  }
  if (input.standaloneAuthorSplitPct + input.standalonePlatformSplitPct !== 100) {
    return { success: false, error: "Standalone split percentages must add up to exactly 100." };
  }
  if (
    input.inPublicationAuthorSplitPct + input.inPublicationOwnerSplitPct + input.inPublicationPlatformSplitPct !==
    100
  ) {
    return { success: false, error: "In-publication split percentages must add up to exactly 100." };
  }

  const [existing] = await db.select({ id: platformConfig.id }).from(platformConfig).limit(1);
  if (!existing) return { success: false, error: "Platform config row not found — was the database seeded?" };

  await db
    .update(platformConfig)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(platformConfig.id, existing.id));

  revalidatePath("/dashboard/admin/settings/fees");
  return { success: true };
}
