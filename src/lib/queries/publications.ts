import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { publications, users, articles, categories, articleAuthors } from "../../../drizzle/schema/index";
import type { ArticleCardData } from "@/components/shared/ArticleCard";

export async function getPublicationBySlug(slug: string) {
  const [row] = await db
    .select({
      id: publications.id,
      name: publications.name,
      slug: publications.slug,
      description: publications.description,
      coverImageUrl: publications.coverImageUrl,
      ownerId: publications.ownerId,
      ownerName: users.name,
    })
    .from(publications)
    .innerJoin(users, eq(publications.ownerId, users.id))
    .where(eq(publications.slug, slug))
    .limit(1);
  return row ?? null;
}

// Scalability: previously fetched every article ever published into
// this Publication with no limit at all — fine for a new masthead,
// but unbounded over a Publication's real lifetime, and this backs a
// public page (src/app/(marketing)/publication/[slug]/page.tsx) with
// no pagination UI on top of it. Capped to the same 24-per-page size
// used elsewhere in this codebase (getRecentArticles) rather than
// leaving it truly unbounded; adding real pagination to this page is
// a larger UI change out of scope for this pass, but this keeps the
// query itself from growing without limit in the meantime.
const PUBLICATION_ARTICLES_LIMIT = 24;

export async function getPublicationArticleCards(publicationId: string): Promise<ArticleCardData[]> {
  const rows = await db
    .select({
      id: articles.id,
      slug: articles.slug,
      title: articles.title,
      excerpt: articles.excerpt,
      coverImageUrl: articles.coverImageUrl,
      isPremium: articles.isPremium,
      publishedAt: articles.publishedAt,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(articles)
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .where(and(eq(articles.publicationId, publicationId), eq(articles.status, "published")))
    .orderBy(desc(articles.publishedAt))
    .limit(PUBLICATION_ARTICLES_LIMIT);

  const articleIds = rows.map((r) => r.id);
  const authorRows =
    articleIds.length > 0
      ? await db
          .select({
            articleId: articleAuthors.articleId,
            isPrimary: articleAuthors.isPrimary,
            name: users.name,
            avatarUrl: users.avatarUrl,
          })
          .from(articleAuthors)
          .innerJoin(users, eq(articleAuthors.userId, users.id))
          .where(inArray(articleAuthors.articleId, articleIds))
      : [];

  const authorMap = new Map<string, { name: string | null; avatarUrl: string | null }>();
  for (const row of authorRows) {
    const existing = authorMap.get(row.articleId);
    if (!existing || row.isPrimary) authorMap.set(row.articleId, { name: row.name, avatarUrl: row.avatarUrl });
  }

  return rows.map((row) => ({
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    coverImageUrl: row.coverImageUrl,
    isPremium: row.isPremium,
    publishedAt: row.publishedAt,
    category: { name: row.categoryName, slug: row.categorySlug },
    author: authorMap.get(row.id) ?? { name: null, avatarUrl: null },
  }));
}
