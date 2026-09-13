import { SkeletonBlock } from "@/components/shared/SkeletonBlock";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { SectionContainer } from "@/components/shared/SectionContainer";

// Streamed fallback for the homepage while getRecentArticles() resolves.
// Mirrors HomeHero's featured+rail shape followed by a 3-col grid, so the
// layout doesn't jump once real content arrives — see SkeletonCard's own
// comment for the shape-matching rule this follows.
export default function HomeLoading() {
  return (
    <>
      <section className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SkeletonBlock className="aspect-[16/10] w-full rounded-[4px]" />
            <div className="mt-4 flex flex-col gap-2">
              <SkeletonBlock className="h-3 w-28" />
              <SkeletonBlock className="h-8 w-full" />
              <SkeletonBlock className="h-8 w-3/4" />
            </div>
          </div>
          <div className="flex flex-col gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <SkeletonBlock className="h-16 w-24 shrink-0 rounded-[4px]" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <SkeletonBlock className="h-3 w-16" />
                  <SkeletonBlock className="h-4 w-full" />
                  <SkeletonBlock className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionContainer>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </SectionContainer>
    </>
  );
}
