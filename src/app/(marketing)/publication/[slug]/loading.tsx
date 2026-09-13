import { SkeletonBlock } from "@/components/shared/SkeletonBlock";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { SectionContainer } from "@/components/shared/SectionContainer";

// Streamed fallback for a Publication page while getPublicationBySlug()/
// getPublicationArticleCards() resolve. Mirrors the real ink-band header
// (avatar + name + description + byline) plus the article grid below.
export default function PublicationLoading() {
  return (
    <div>
      <div className="bg-ink">
        <div className="mx-auto flex max-w-[1320px] flex-col items-center px-4 py-16 sm:px-6">
          <SkeletonBlock className="mb-6 h-24 w-24 rounded-full bg-white/10" />
          <SkeletonBlock className="h-8 w-64 bg-white/10" />
          <SkeletonBlock className="mt-3 h-4 w-80 bg-white/10" />
          <SkeletonBlock className="mt-4 h-3 w-40 bg-white/10" />
        </div>
      </div>

      <SectionContainer>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </SectionContainer>
    </div>
  );
}
