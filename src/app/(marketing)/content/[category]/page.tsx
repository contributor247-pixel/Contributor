import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { categories } from "../../../../../drizzle/schema/index";
import { getPopularCategoryPills } from "@/lib/queries/articles";
import { HeroBand } from "@/components/shared/HeroBand";
import { TopicExplorerStrip } from "@/components/shared/TopicExplorerStrip";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { ArticleListingGrid } from "@/components/shared/ArticleListingGrid";
import { buildMetadata } from "@/lib/seo";

interface CategoryListingPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: CategoryListingPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const [category] = await db.select().from(categories).where(eq(categories.slug, categorySlug)).limit(1);
  if (!category) return buildMetadata({ title: "Category", description: "", path: `/content/${categorySlug}`, noIndex: true });

  return buildMetadata({
    title: category.name,
    description: `Explore every published article in ${category.name} on Contributor.`,
    path: `/content/${categorySlug}`,
  });
}

export default async function CategoryListingPage({ params, searchParams }: CategoryListingPageProps) {
  const { category: categorySlug } = await params;
  const [{ page: pageParam }, popularCategories] = await Promise.all([
    searchParams,
    getPopularCategoryPills(12),
  ]);
  const page = Math.max(1, Number(pageParam) || 1);

  const [category] = await db.select().from(categories).where(eq(categories.slug, categorySlug)).limit(1);
  if (!category) notFound();

  return (
    <>
      <HeroBand
        eyebrow="Curated Topic Archive"
        title={category.name}
        description={`Explore all published stories and critical perspectives in ${category.name}.`}
      />
      <TopicExplorerStrip categories={popularCategories} activeSlug={categorySlug} />
      <SectionContainer>
        <ArticleListingGrid
          page={page}
          basePath={`/content/${categorySlug}`}
          categorySlug={categorySlug}
          categoryName={category.name}
        />
      </SectionContainer>
    </>
  );
}
