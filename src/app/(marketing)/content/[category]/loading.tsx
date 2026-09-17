import { SkeletonBlock } from "@/components/shared/SkeletonBlock";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { TopicExplorerStrip } from "@/components/shared/TopicExplorerStrip";

// Streamed fallback for a category listing page. The real HeroBand needs
// the category name from the DB, so this skeletonizes the band itself
// rather than reusing HeroBand with placeholder text. The real page
// also renders TopicExplorerStrip right after the hero — rendering it
// here too (with an empty categories list, it falls back to its own
// built-in default pills) keeps that bar present and stable through
// the loading -> loaded transition instead of it popping in and
// shifting the grid below it down.
export default function CategoryLoading() {
  return (
    <>
      <section className="bg-primary px-4 py-20 text-center sm:px-6">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3">
          <SkeletonBlock variant="dark" className="h-3 w-40" />
          <SkeletonBlock variant="dark" className="h-10 w-64" />
          <SkeletonBlock variant="dark" className="h-4 w-80" />
        </div>
      </section>
      <TopicExplorerStrip categories={[]} />
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
