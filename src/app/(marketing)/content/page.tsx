import { HeroBand } from "@/components/shared/HeroBand";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { ArticleListingGrid } from "@/components/shared/ArticleListingGrid";

interface ContentListingPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function ContentListingPage({ searchParams }: ContentListingPageProps) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  return (
    <>
      <HeroBand
        eyebrow="Discover All Topics"
        title="Content Listing"
        description="Discover our complete content collection, systematically organized for your convenience. Navigate through diverse categories and uncover valuable insights."
      />
      <SectionContainer>
        <ArticleListingGrid page={page} basePath="/content" />
      </SectionContainer>
    </>
  );
}
