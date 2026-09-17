import { SkeletonBlock } from "@/components/shared/SkeletonBlock";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { HeroBand } from "@/components/shared/HeroBand";
import { TopicExplorerStrip } from "@/components/shared/TopicExplorerStrip";

// Streamed fallback for the content listing grid while
// ArticleListingGrid's query resolves. Reuses the real HeroBand copy
// (not a paraphrase), renders the real TopicExplorerStrip (with an
// empty categories list, it falls back to its own built-in default
// pills), and skeletonizes ArticleListingGrid's own "Live Catalog ·
// Showing X-Y of Z" status bar above the grid — so the page doesn't
// visibly reflow (different heading text, category bar or status bar
// popping in, grid jumping down) the instant real content replaces
// this skeleton; only the cards themselves should visibly change.
export default function ContentLoading() {
  return (
    <>
      <HeroBand
        eyebrow="The Full Discovery Catalog"
        title="All Editorial Dispatches"
        description="Explore our complete collection of curated reporting, essays, and independent journalism across all topics."
      />
      <TopicExplorerStrip categories={[]} activeSlug="all" />
      <SectionContainer>
        <div className="mb-8 flex flex-col justify-between gap-3 border-b border-border/70 pb-4 sm:flex-row sm:items-center">
          <SkeletonBlock className="h-4 w-56" />
          <SkeletonBlock className="h-5 w-20" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </SectionContainer>
    </>
  );
}
