import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { categories } from "../../../../../drizzle/schema/index";
import { HeroBand } from "@/components/shared/HeroBand";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { ArticleListingGrid } from "@/components/shared/ArticleListingGrid";

interface CategoryListingPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function CategoryListingPage({ params, searchParams }: CategoryListingPageProps) {
  const { category: categorySlug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [category] = await db.select().from(categories).where(eq(categories.slug, categorySlug)).limit(1);
  if (!category) notFound();

  return (
    <>
      <HeroBand
        eyebrow="Discover All Topics"
        title={category.name}
        description={`Explore every published article in ${category.name}.`}
      />
      <SectionContainer>
        <ArticleListingGrid page={page} basePath={`/content/${categorySlug}`} categorySlug={categorySlug} />
      </SectionContainer>
    </>
  );
}
