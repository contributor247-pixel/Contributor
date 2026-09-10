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
} from "../../../drizzle/schema/index";
import { requireRole } from "@/lib/permissions";
import { resend } from "@/lib/resend";
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
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "Contributor <onboarding@resend.dev>",
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

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt,
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
    .orderBy(desc(reports.createdAt));

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

  await db
    .update(reports)
    .set({
      status: "dismissed",
      adminActionTaken: "dismissed",
      actionedByUserId: session.user.id,
      actionedAt: new Date(),
    })
    .where(eq(reports.id, reportId));

  revalidatePath("/dashboard/admin/moderation");
  return { success: true };
}

export async function unpublishArticleAction(reportId: string, articleId: string): Promise<AdminActionResult> {
  const session = await requireRole("admin");

  const [report] = await db.select({ reason: reports.reason }).from(reports).where(eq(reports.id, reportId)).limit(1);
  const [article] = await db.select({ title: articles.title }).from(articles).where(eq(articles.id, articleId)).limit(1);
  const [primaryAuthor] = await db
    .select({ userId: articleAuthors.userId })
    .from(articleAuthors)
    .where(and(eq(articleAuthors.articleId, articleId), eq(articleAuthors.isPrimary, true)))
    .limit(1);

  await db.update(articles).set({ status: "unpublished", updatedAt: new Date() }).where(eq(articles.id, articleId));
  await db
    .update(reports)
    .set({
      status: "actioned",
      adminActionTaken: "unpublished",
      actionedByUserId: session.user.id,
      actionedAt: new Date(),
    })
    .where(eq(reports.id, reportId));

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

  const [report] = await db.select({ reason: reports.reason }).from(reports).where(eq(reports.id, reportId)).limit(1);

  await db.update(users).set({ status: "suspended", updatedAt: new Date() }).where(eq(users.id, authorUserId));
  await db
    .update(reports)
    .set({
      status: "actioned",
      adminActionTaken: "author_suspended",
      actionedByUserId: session.user.id,
      actionedAt: new Date(),
    })
    .where(eq(reports.id, reportId));

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
  if (input.payPerArticleMinCents > input.payPerArticleMaxCents) {
    return { success: false, error: "Pay-per-article minimum cannot exceed the maximum." };
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
