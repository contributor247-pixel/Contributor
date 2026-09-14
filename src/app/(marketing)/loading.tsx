import { SkeletonBlock } from "@/components/shared/SkeletonBlock";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { SectionContainer } from "@/components/shared/SectionContainer";

// Streamed fallback for the homepage while getRecentArticles() resolves.
// Mirrors HomeHero's actual current shape (src/components/shared/
// HomeHero.tsx) — a full-bleed dark hero (68-82vh, matching its real
// responsive height steps) with the headline block pinned to the
// bottom-left, then a thumbnail rail strip, then the card grid below.
// This replaces an earlier skeleton that still matched HomeHero's
// pre-redesign shape (a small light-background split layout) — the
// redesign session updated the real hero but missed updating this file
// to match, so the loading state stopped resembling the real layout.
export default function HomeLoading() {
  return (
    <>
      <div
        data-dark-surface
        className="relative flex h-[68vh] min-h-[440px] w-full flex-col justify-end overflow-hidden bg-ink px-4 pb-10 sm:h-[74vh] sm:min-h-[560px] sm:px-6 sm:pb-14 lg:h-[82vh] lg:max-h-[780px] lg:px-8 lg:pb-20"
      >
        <div className="mx-auto w-full max-w-[1320px]">
          <div className="max-w-2xl">
            <SkeletonBlock variant="dark" className="h-3 w-40" />
            <SkeletonBlock variant="dark" className="mt-4 h-12 w-full sm:h-16" />
            <SkeletonBlock variant="dark" className="mt-2 h-12 w-3/4 sm:h-16" />
            <SkeletonBlock variant="dark" className="mt-5 hidden h-4 w-full max-w-xl sm:block" />
          </div>
        </div>
      </div>

      {/* Rail strip — matches HomeHero's thumbnail rail below the hero. */}
      <div className="grid grid-cols-2 gap-px border-t border-white/10 bg-white/10 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 bg-ink p-4 sm:p-5">
            <SkeletonBlock variant="dark" className="h-14 w-14 shrink-0 sm:h-16 sm:w-16" />
            <div className="min-w-0 flex-1">
              <SkeletonBlock variant="dark" className="h-3 w-16" />
              <SkeletonBlock variant="dark" className="mt-1.5 h-4 w-full" />
            </div>
          </div>
        ))}
      </div>

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
