import { SkeletonBlock } from "@/components/shared/SkeletonBlock";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { SectionContainer } from "@/components/shared/SectionContainer";

// Streamed fallback for a category listing page. The real HeroBand needs
// the category name from the DB, so this skeletonizes the band itself
// rather than reusing HeroBand with placeholder text.
export default function CategoryLoading() {
  return (
    <>
      <section className="bg-primary px-4 py-20 text-center sm:px-6">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3">
          <SkeletonBlock className="h-3 w-40 bg-white/20" />
          <SkeletonBlock className="h-10 w-64 bg-white/20" />
          <SkeletonBlock className="h-4 w-80 bg-white/20" />
        </div>
      </section>
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
