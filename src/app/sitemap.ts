import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { articles, categories, publications } from "../../drizzle/schema/index";
import { SITE_URL } from "@/lib/seo";

// Covers every published article, active category, and Publication,
// per docs/04_MasterBuildGuide.md Step 16.2. No author-profile entries
// — that page was never built in this project's step sequence, so
// there's no URL to list. Revalidates on each request rather than
// being statically generated at build time, since new articles
// publish continuously.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articleRows, categoryRows, publicationRows] = await Promise.all([
    db
      .select({ slug: articles.slug, updatedAt: articles.updatedAt })
      .from(articles)
      .where(eq(articles.status, "published")),
    db.select({ slug: categories.slug }).from(categories).where(eq(categories.deprecated, false)),
    db.select({ slug: publications.slug }).from(publications),
  ]);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "hourly", priority: 1 },
    { url: `${SITE_URL}/content`, changeFrequency: "hourly", priority: 0.8 },
  ];

  const articleEntries: MetadataRoute.Sitemap = articleRows.map((a) => ({
    url: `${SITE_URL}/article/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categoryRows.map((c) => ({
    url: `${SITE_URL}/content/${c.slug}`,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  const publicationEntries: MetadataRoute.Sitemap = publicationRows.map((p) => ({
    url: `${SITE_URL}/publication/${p.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticEntries, ...articleEntries, ...categoryEntries, ...publicationEntries];
}
