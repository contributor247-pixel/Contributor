import { SkeletonBlock } from "@/components/shared/SkeletonBlock";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { SectionContainer } from "@/components/shared/SectionContainer";

// Exact layout-matched streamed fallback for the homepage while getRecentArticles() resolves.
// Replicates the real landing page structure 1:1: Hero + Rail + Trust Strip + Topic Explorer +
// Grid A + AuthorPro Band + Editor's Picks Bento + Grid B.
export default function HomeLoading() {
  return (
    <>
      {/* 1. Hero Skeleton */}
      <div
        data-dark-surface
        className="relative flex h-[72vh] min-h-[480px] w-full flex-col justify-end overflow-hidden bg-ink px-4 pb-12 sm:h-[78vh] sm:min-h-[580px] sm:px-6 sm:pb-16 lg:h-[84vh] lg:max-h-[820px] lg:px-8 lg:pb-22"
      >
        <div className="mx-auto w-full max-w-[1320px]">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2.5">
              <SkeletonBlock variant="dark" className="h-6 w-36 rounded-full" />
              <SkeletonBlock variant="dark" className="h-6 w-24 rounded-full" />
              <SkeletonBlock variant="dark" className="h-4 w-28" />
            </div>
            <SkeletonBlock variant="dark" className="mt-4 h-12 w-full sm:h-16" />
            <SkeletonBlock variant="dark" className="mt-2 h-12 w-4/5 sm:h-16" />
            <SkeletonBlock variant="dark" className="mt-4 hidden h-5 w-full max-w-2xl sm:block" />
            <div className="mt-6 flex items-center gap-6">
              <div className="flex items-center gap-2.5">
                <SkeletonBlock variant="dark" className="h-8 w-8 rounded-full" />
                <SkeletonBlock variant="dark" className="h-4 w-32" />
              </div>
              <SkeletonBlock variant="dark" className="h-10 w-44 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Rail Strip Skeleton */}
      <div className="border-t border-white/10 bg-ink-soft">
        <div className="mx-auto grid max-w-[1320px] grid-cols-1 divide-y divide-white/10 sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3.5 p-4 sm:p-5">
              <SkeletonBlock variant="dark" className="h-15 w-15 shrink-0 rounded-lg sm:h-16 sm:w-16" />
              <div className="min-w-0 flex-1">
                <SkeletonBlock variant="dark" className="h-3 w-20" />
                <SkeletonBlock variant="dark" className="mt-1.5 h-4 w-full" />
                <SkeletonBlock variant="dark" className="mt-1 h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Platform Trust Strip Skeleton */}
      <div className="border-b border-t border-white/[0.08] bg-ink">
        <div className="mx-auto grid max-w-[1320px] grid-cols-2 gap-4 px-4 py-4 sm:px-6 md:grid-cols-4 lg:px-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <SkeletonBlock variant="dark" className="h-4 w-4 rounded-full shrink-0" />
              <SkeletonBlock variant="dark" className="h-3.5 w-36" />
            </div>
          ))}
        </div>
      </div>

      {/* 4. Topic Explorer Strip Skeleton */}
      <div className="border-b border-t border-border/80 bg-surface/80 py-3">
        <div className="mx-auto flex max-w-[1320px] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <SkeletonBlock className="h-7 w-28 rounded-full" />
          <div className="flex flex-1 items-center gap-2 overflow-hidden">
            {Array.from({ length: 7 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-7 w-24 shrink-0 rounded-full" />
            ))}
          </div>
        </div>
      </div>

      {/* 5. Section 01: Curated Dispatches Grid Skeleton */}
      <SectionContainer
        eyebrow="Chapter 01 • Curated"
        heading="Featured Dispatches & Deep Thought"
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </SectionContainer>

      {/* 6. AuthorPro Band Skeleton */}
      <SectionContainer>
        <div className="rounded-3xl border border-white/15 bg-ink p-8 sm:p-12 lg:p-16">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <SkeletonBlock variant="dark" className="h-5 w-32 rounded-full" />
              <SkeletonBlock variant="dark" className="mt-4 h-10 w-full sm:h-12" />
              <SkeletonBlock variant="dark" className="mt-2 h-10 w-3/4 sm:h-12" />
              <SkeletonBlock variant="dark" className="mt-4 h-4 w-full" />
              <div className="mt-6 flex flex-wrap gap-2.5">
                <SkeletonBlock variant="dark" className="h-8 w-36 rounded-full" />
                <SkeletonBlock variant="dark" className="h-8 w-36 rounded-full" />
                <SkeletonBlock variant="dark" className="h-8 w-36 rounded-full" />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <SkeletonBlock variant="dark" className="h-12 w-48 rounded-full" />
              <SkeletonBlock variant="dark" className="h-8 w-44 rounded-full" />
            </div>
          </div>
        </div>
      </SectionContainer>

      {/* 7. Section 02: Editor's Picks Bento Skeleton */}
      <SectionContainer
        eyebrow="Chapter 02 • Editors' Desk"
        heading="Top Picks & Cultural Dialogue"
      >
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Spotlight Left */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-border/80 bg-surface p-4 sm:p-6 shadow-sm">
              <SkeletonBlock className="aspect-[16/9] w-full rounded-xl" />
              <div className="mt-4 flex items-center gap-2">
                <SkeletonBlock className="h-3 w-20" />
                <SkeletonBlock className="h-3 w-16" />
              </div>
              <SkeletonBlock className="mt-3 h-7 w-4/5" />
              <SkeletonBlock className="mt-2 h-4 w-full" />
              <SkeletonBlock className="mt-1 h-4 w-3/4" />
              <div className="mt-6 pt-4 flex items-center justify-between border-t border-border/60">
                <div className="flex items-center gap-2">
                  <SkeletonBlock className="h-7 w-7 rounded-full" />
                  <SkeletonBlock className="h-3.5 w-28" />
                </div>
                <SkeletonBlock className="h-6 w-20 rounded-full" />
              </div>
            </div>
          </div>

          {/* Leaderboard Right */}
          <div className="flex flex-col rounded-2xl border border-border/80 bg-surface p-5 sm:p-6 shadow-sm lg:col-span-5">
            <div className="mb-4 flex items-center justify-between border-b border-border/70 pb-3">
              <SkeletonBlock className="h-4 w-32" />
              <SkeletonBlock className="h-3 w-10" />
            </div>
            <div className="flex flex-1 flex-col divide-y divide-border/70">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-4 py-4">
                  <SkeletonBlock className="h-8 w-8 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <SkeletonBlock className="h-3 w-24" />
                    <SkeletonBlock className="mt-1.5 h-4 w-full" />
                    <SkeletonBlock className="mt-1 h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionContainer>
    </>
  );
}

