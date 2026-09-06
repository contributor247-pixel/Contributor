import { and, count, desc, eq, ilike, inArray, ne, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { articles, articleAuthors, articleTags, categories, tags, users } from "../../../drizzle/schema/index";
import type { ArticleCardData } from "@/components/shared/ArticleCard";

const PUBLISHED = eq(articles.status, "published");

// Fetches the primary author (or the first author row if none flagged
// primary) for each article id, in one query using inArray rather than
// N+1 lookups.
async function authorsForArticles(articleIds: string[]): Promise<Map<string, { name: string | null; avatarUrl: string | null }>> {
  if (articleIds.length === 0) return new Map();
  const rows = await db
    .select({
      articleId: articleAuthors.articleId,
      isPrimary: articleAuthors.isPrimary,
      name: users.name,
      avatarUrl: users.avatarUrl,
    })
    .from(articleAuthors)
    .innerJoin(users, eq(articleAuthors.userId, users.id))
    .where(inArray(articleAuthors.articleId, articleIds));

  const map = new Map<string, { name: string | null; avatarUrl: string | null }>();
  for (const row of rows) {
    const existing = map.get(row.articleId);
    if (!existing || row.isPrimary) {
      map.set(row.articleId, { name: row.name, avatarUrl: row.avatarUrl });
    }
  }
  return map;
}

type RawArticleRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  isPremium: boolean;
  publishedAt: Date | null;
  categoryName: string;
  categorySlug: string;
};

async function toCardData(rows: RawArticleRow[]): Promise<ArticleCardData[]> {
  const authorMap = await authorsForArticles(rows.map((r) => r.id));
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

const baseSelect = {
  id: articles.id,
  slug: articles.slug,
  title: articles.title,
  excerpt: articles.excerpt,
  coverImageUrl: articles.coverImageUrl,
  isPremium: articles.isPremium,
  publishedAt: articles.publishedAt,
  categoryName: categories.name,
  categorySlug: categories.slug,
};

export async function getRecentArticles(limit: number, excludeId?: string): Promise<ArticleCardData[]> {
  const rows = await db
    .select(baseSelect)
    .from(articles)
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .where(excludeId ? and(PUBLISHED, ne(articles.id, excludeId)) : PUBLISHED)
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
  return toCardData(rows);
}

export async function getArticlesByCategorySlug(categorySlug: string, limit: number): Promise<ArticleCardData[]> {
  const rows = await db
    .select(baseSelect)
    .from(articles)
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .where(and(PUBLISHED, eq(categories.slug, categorySlug)))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
  return toCardData(rows);
}

export async function getPaginatedArticles(
  page: number,
  perPage: number,
  categorySlug?: string
): Promise<{ items: ArticleCardData[]; totalCount: number }> {
  const where = categorySlug ? and(PUBLISHED, eq(categories.slug, categorySlug)) : PUBLISHED;

  const [{ value: totalCount }] = await db
    .select({ value: count() })
    .from(articles)
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .where(where);

  const rows = await db
    .select(baseSelect)
    .from(articles)
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .where(where)
    .orderBy(desc(articles.publishedAt))
    .limit(perPage)
    .offset((page - 1) * perPage);

  return { items: await toCardData(rows), totalCount };
}

export async function searchArticles(query: string, limit = 24): Promise<ArticleCardData[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const pattern = `%${trimmed}%`;

  const tagMatchArticleIds = await db
    .select({ articleId: articleTags.articleId })
    .from(articleTags)
    .innerJoin(tags, eq(articleTags.tagId, tags.id))
    .where(ilike(tags.name, pattern));
  const tagArticleIds = tagMatchArticleIds.map((r) => r.articleId);

  const where = and(
    PUBLISHED,
    or(
      ilike(articles.title, pattern),
      ilike(articles.excerpt, pattern),
      tagArticleIds.length > 0 ? inArray(articles.id, tagArticleIds) : undefined
    )
  );

  const rows = await db
    .select(baseSelect)
    .from(articles)
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .where(where)
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
  return toCardData(rows);
}

export async function getPopularCategoryPills(limit = 5): Promise<{ name: string; slug: string }[]> {
  const rows = await db
    .select({
      name: categories.name,
      slug: categories.slug,
      articleCount: count(articles.id),
    })
    .from(categories)
    .innerJoin(articles, and(eq(articles.categoryId, categories.id), PUBLISHED))
    .where(eq(categories.deprecated, false))
    .groupBy(categories.id)
    .orderBy(desc(count(articles.id)))
    .limit(limit);
  return rows.map(({ name, slug }) => ({ name, slug }));
}

export async function getArticleBySlug(slug: string) {
  const [row] = await db
    .select({
      id: articles.id,
      slug: articles.slug,
      title: articles.title,
      body: articles.body,
      excerpt: articles.excerpt,
      coverImageUrl: articles.coverImageUrl,
      isPremium: articles.isPremium,
      priceCents: articles.priceCents,
      publicationId: articles.publicationId,
      status: articles.status,
      publishedAt: articles.publishedAt,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(articles)
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .where(and(eq(articles.slug, slug), PUBLISHED))
    .limit(1);
  if (!row) return null;

  const authorRows = await db
    .select({
      userId: articleAuthors.userId,
      isPrimary: articleAuthors.isPrimary,
      name: users.name,
      avatarUrl: users.avatarUrl,
    })
    .from(articleAuthors)
    .innerJoin(users, eq(articleAuthors.userId, users.id))
    .where(eq(articleAuthors.articleId, row.id));

  authorRows.sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));

  return { ...row, authors: authorRows };
}
