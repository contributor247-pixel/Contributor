"use server";

import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  articles,
  articleAuthors,
  articleTags,
  tags,
  users,
  platformConfig,
  publications,
  invites,
} from "../../../drizzle/schema/index";
import { requireVerifiedAuthor, requireAuthorPro } from "@/lib/permissions";
import { articleSchema, type ArticleInput } from "@/lib/validators/article";
import { slugify } from "@/lib/slugify";

export type ArticleActionResult =
  | { success: true; articleId: string; slug: string }
  | { success: false; error: string };

async function resolveTagIds(tagNames: string[]): Promise<string[]> {
  const ids: string[] = [];
  for (const rawName of tagNames) {
    const name = rawName.trim();
    if (!name) continue;
    const slug = slugify(name);
    const [existing] = await db.select().from(tags).where(eq(tags.slug, slug)).limit(1);
    if (existing) {
      ids.push(existing.id);
      continue;
    }
    // Check-then-insert isn't atomic: two articles saved concurrently
    // with the same brand-new tag can both miss the existence check
    // above and both attempt to insert it. onConflictDoNothing makes
    // the losing insert a no-op instead of an unhandled unique-
    // constraint throw, and the re-select picks up the winner's row.
    const [created] = await db.insert(tags).values({ name, slug }).onConflictDoNothing().returning();
    if (created) {
      ids.push(created.id);
      continue;
    }
    const [winner] = await db.select().from(tags).where(eq(tags.slug, slug)).limit(1);
    if (winner) ids.push(winner.id);
  }
  return ids;
}

// body is Tiptap-generated HTML (see EditorCanvas), so the excerpt must
// strip tags before truncating — otherwise raw markup leaks into card
// previews and search results instead of readable text.
function buildExcerpt(bodyHtml: string): string {
  const plain = bodyHtml
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= 200) return plain;
  return plain.slice(0, 200).replace(/\s+\S*$/, "") + "...";
}

async function generateUniqueSlug(title: string, excludeArticleId?: string): Promise<string> {
  const base = slugify(title) || "article";
  let candidate = base;
  let suffix = 1;
  for (;;) {
    const [existing] = await db
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.slug, candidate))
      .limit(1);
    if (!existing || existing.id === excludeArticleId) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}

// Joint authorship is always free per docs/00_ScopeDocument.md Section
// 7.1 — this is a hard server-side rule with no UI or API path around
// it, checked here regardless of what the caller requested.
function resolveIsPremium(requestedPremium: boolean, hasCoAuthors: boolean): boolean {
  return hasCoAuthors ? false : requestedPremium;
}

// Resolves the final isPremium/priceCents pair server-side: only an
// active AuthorPro account (checked fresh, never trusting client
// state) may set isPremium=true, and the price must fall within the
// admin-configured pay-per-article bounds. Any violation silently
// downgrades to a free article rather than erroring, since the
// article itself is still valid content — just not monetizable as
// requested.
async function resolvePremiumFields(
  requestedPremium: boolean,
  requestedPriceCents: number | null | undefined,
  hasCoAuthors: boolean
): Promise<{ isPremium: boolean; priceCents: number | null }> {
  let isPremium = resolveIsPremium(requestedPremium, hasCoAuthors);
  if (!isPremium) return { isPremium: false, priceCents: null };

  try {
    await requireAuthorPro();
  } catch {
    return { isPremium: false, priceCents: null };
  }

  const [config] = await db.select().from(platformConfig).limit(1);
  const price = requestedPriceCents ?? 0;
  if (!config || price < config.payPerArticleMinCents || price > config.payPerArticleMaxCents) {
    return { isPremium: false, priceCents: null };
  }

  return { isPremium: true, priceCents: price };
}

// Resolves and validates the requested Publication assignment
// server-side: the caller must either own the Publication or hold an
// accepted invite to it, per docs/04_MasterBuildGuide.md Step 9 point
// 6 — a forged/stale publicationId from the client is silently
// dropped (article saves as standalone) rather than erroring.
async function resolvePublicationId(
  requestedPublicationId: string | null | undefined,
  userId: string
): Promise<string | null> {
  if (!requestedPublicationId) return null;

  const [publication] = await db
    .select({ ownerId: publications.ownerId })
    .from(publications)
    .where(eq(publications.id, requestedPublicationId))
    .limit(1);
  if (!publication) return null;
  if (publication.ownerId === userId) return requestedPublicationId;

  const [acceptedInvite] = await db
    .select({ id: invites.id })
    .from(invites)
    .where(
      and(
        eq(invites.publicationId, requestedPublicationId),
        eq(invites.invitedUserId, userId),
        eq(invites.status, "accepted")
      )
    )
    .limit(1);
  return acceptedInvite ? requestedPublicationId : null;
}

export async function createArticleAction(input: ArticleInput): Promise<ArticleActionResult> {
  const session = await requireVerifiedAuthor();
  const parsed = articleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;

  const hasCoAuthors = data.coAuthorIds.length > 0;
  const { isPremium, priceCents } = await resolvePremiumFields(data.isPremium, data.priceCents, hasCoAuthors);
  const publicationId = await resolvePublicationId(data.publicationId, session.user.id);

  const slug = await generateUniqueSlug(data.title);
  const tagIds = await resolveTagIds(data.tags);

  let article;
  try {
    [article] = await db
      .insert(articles)
      .values({
        title: data.title,
        slug,
        body: { html: data.body },
        excerpt: buildExcerpt(data.body),
        coverImageUrl: data.coverImageUrl ?? null,
        categoryId: data.categoryId,
        publicationId,
        isPremium,
        priceCents,
        status: data.status,
        publishedAt: data.status === "published" ? new Date() : null,
      })
      .returning();
  } catch {
    // Most likely a slug collision from a near-simultaneous duplicate
    // submission — generateUniqueSlug's read-then-insert isn't
    // transactional, so two requests for the same title can race.
    // Surfacing this distinctly instead of letting it throw uncaught
    // matters because ArticleForm's catch-all message blames "large
    // images", which would be actively misleading here.
    return { success: false, error: "Couldn't save — a very similar title was just published. Please try again." };
  }

  const authorRows = [
    { articleId: article.id, userId: session.user.id, isPrimary: true },
    ...data.coAuthorIds
      .filter((id) => id !== session.user.id)
      .map((id) => ({ articleId: article.id, userId: id, isPrimary: false })),
  ];
  await db.insert(articleAuthors).values(authorRows);

  if (tagIds.length > 0) {
    await db.insert(articleTags).values(tagIds.map((tagId) => ({ articleId: article.id, tagId })));
  }

  return { success: true, articleId: article.id, slug: article.slug };
}

export async function updateArticleAction(
  articleId: string,
  input: ArticleInput
): Promise<ArticleActionResult> {
  const session = await requireVerifiedAuthor();
  const parsed = articleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;

  const [existing] = await db.select().from(articles).where(eq(articles.id, articleId)).limit(1);
  if (!existing) {
    return { success: false, error: "Article not found" };
  }
  const authorRows = await db
    .select()
    .from(articleAuthors)
    .where(eq(articleAuthors.articleId, articleId));
  const isOwnArticle = authorRows.some((row) => row.userId === session.user.id);
  if (!isOwnArticle) {
    return { success: false, error: "You do not have permission to edit this article" };
  }

  const hasCoAuthors = data.coAuthorIds.length > 0;
  const { isPremium, priceCents } = await resolvePremiumFields(data.isPremium, data.priceCents, hasCoAuthors);
  const publicationId = await resolvePublicationId(data.publicationId, session.user.id);

  const slug =
    data.title === existing.title ? existing.slug : await generateUniqueSlug(data.title, articleId);
  const tagIds = await resolveTagIds(data.tags);

  await db
    .update(articles)
    .set({
      title: data.title,
      slug,
      body: { html: data.body },
      excerpt: buildExcerpt(data.body),
      coverImageUrl: data.coverImageUrl ?? null,
      categoryId: data.categoryId,
      publicationId,
      isPremium,
      priceCents,
      status: data.status,
      publishedAt: data.status === "published" && !existing.publishedAt ? new Date() : existing.publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(articles.id, articleId));

  await db.delete(articleAuthors).where(eq(articleAuthors.articleId, articleId));
  const newAuthorRows = [
    { articleId, userId: session.user.id, isPrimary: true },
    ...data.coAuthorIds
      .filter((id) => id !== session.user.id)
      .map((id) => ({ articleId, userId: id, isPrimary: false })),
  ];
  await db.insert(articleAuthors).values(newAuthorRows);

  await db.delete(articleTags).where(eq(articleTags.articleId, articleId));
  if (tagIds.length > 0) {
    await db.insert(articleTags).values(tagIds.map((tagId) => ({ articleId, tagId })));
  }

  return { success: true, articleId, slug };
}

export type DeleteArticleResult = { success: true } | { success: false; error: string };

// Soft delete: sets status to "unpublished" (hidden from public) rather
// than removing the row, so ledger/report history integrity is
// preserved for anything already monetized, per the guide's explicit
// instruction.
export async function deleteArticleAction(articleId: string): Promise<DeleteArticleResult> {
  const session = await requireVerifiedAuthor();
  const authorRows = await db
    .select()
    .from(articleAuthors)
    .where(eq(articleAuthors.articleId, articleId));
  const isOwnArticle = authorRows.some((row) => row.userId === session.user.id);
  if (!isOwnArticle) {
    return { success: false, error: "You do not have permission to delete this article" };
  }

  await db
    .update(articles)
    .set({ status: "unpublished", updatedAt: new Date() })
    .where(eq(articles.id, articleId));

  return { success: true };
}

export type PremiumEligibility = {
  isAuthorPro: boolean;
  minPriceCents: number;
  maxPriceCents: number;
  defaultPriceCents: number;
};

// Called by the article form to decide whether to show the Premium
// toggle at all. Purely informational for the UI — the actions above
// re-check requireAuthorPro() and the price bounds themselves on
// every save, so a stale/forged client value here can never bypass
// enforcement.
export async function getPremiumEligibilityAction(): Promise<PremiumEligibility> {
  await requireVerifiedAuthor();
  let isAuthorPro = true;
  try {
    await requireAuthorPro();
  } catch {
    isAuthorPro = false;
  }
  const [config] = await db.select().from(platformConfig).limit(1);
  return {
    isAuthorPro,
    minPriceCents: config?.payPerArticleMinCents ?? 99,
    maxPriceCents: config?.payPerArticleMaxCents ?? 4999,
    defaultPriceCents: config?.payPerArticleDefaultCents ?? 499,
  };
}

export type CoAuthorCandidate = { id: string; name: string | null; email: string };

export async function searchAuthorsAction(query: string): Promise<CoAuthorCandidate[]> {
  const session = await requireVerifiedAuthor();
  if (!query.trim()) return [];

  // Only role "author" — Admin is excluded from co-authoring an
  // article (docs/00_ScopeDocument.md Section 3). Admin surfaced here
  // could be added as a co-author with no ability to ever see/manage
  // that article on their own dashboard (requireVerifiedAuthor() now
  // requires role "author"), a dead-end co-authorship.
  const rows = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role, status: users.status })
    .from(users)
    .where(eq(users.role, "author"))
    .limit(50);

  const needle = query.trim().toLowerCase();
  return rows
    .filter((u) => u.status === "active")
    .filter((u) => u.id !== session.user.id)
    .filter((u) => (u.name ?? "").toLowerCase().includes(needle) || u.email.toLowerCase().includes(needle))
    .slice(0, 10)
    .map(({ id, name, email }) => ({ id, name, email }));
}
