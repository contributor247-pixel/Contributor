import type { Metadata } from "next";
import { getPopularCategoryPills } from "@/lib/queries/articles";
import { HeroBand } from "@/components/shared/HeroBand";
import { TopicExplorerStrip } from "@/components/shared/TopicExplorerStrip";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { ArticleListingGrid } from "@/components/shared/ArticleListingGrid";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "All Editorial Dispatches",
  description: "Browse every published article on Contributor, organized across all topics and categories.",
  path: "/content",
});

interface ContentListingPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function ContentListingPage({ searchParams }: ContentListingPageProps) {
  const [{ page: pageParam }, popularCategories] = await Promise.all([
    searchParams,
    getPopularCategoryPills(12),
  ]);
  const page = Math.max(1, Number(pageParam) || 1);

  return (
    <>
      <HeroBand
        eyebrow="The Full Discovery Catalog"
        title="All Editorial Dispatches"
        description="Explore our complete collection of curated reporting, essays, and independent journalism across all topics."
      />
      <TopicExplorerStrip categories={popularCategories} activeSlug="all" />
      <SectionContainer>
        <ArticleListingGrid page={page} basePath="/content" />
      </SectionContainer>
    </>
  );
}
