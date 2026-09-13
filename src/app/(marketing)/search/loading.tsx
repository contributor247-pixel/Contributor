import { SkeletonBlock } from "@/components/shared/SkeletonBlock";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { SectionContainer } from "@/components/shared/SectionContainer";

// Streamed fallback while searchArticles() resolves. Search is
// query-string driven (not a Suspense boundary around a slow param), but
// the query itself still awaits the DB, so this covers that same window.
export default function SearchLoading() {
  return (
    <SectionContainer headingLevel="h1">
      <SkeletonBlock className="mb-8 h-8 w-72" />
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </SectionContainer>
  );
}
