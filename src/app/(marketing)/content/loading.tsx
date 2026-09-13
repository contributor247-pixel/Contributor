import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { HeroBand } from "@/components/shared/HeroBand";

// Streamed fallback for the content listing grid (and, via the
// [category] route reusing this same shape, category listings too)
// while ArticleListingGrid's query resolves.
export default function ContentLoading() {
  return (
    <>
      <HeroBand
        eyebrow="Discover All Topics"
        title="Content Listing"
        description="Discover our complete content collection, systematically organized for your convenience. Navigate through diverse categories and uncover valuable insights."
      />
      <SectionContainer>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </SectionContainer>
    </>
  );
}
