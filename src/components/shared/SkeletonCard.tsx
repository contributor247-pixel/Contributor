import { SkeletonBlock } from "./SkeletonBlock";

// Mirrors ArticleCard's real layout (16:10 cover, eyebrow, two-line
// title, avatar + byline row) per docs/02_ThemeGuideline.md Section
// 8.3's shape-matching rule — used wherever a grid of ArticleCards is
// still loading (homepage, content listing, search results).
export function SkeletonCard() {
  return (
    <div className="flex flex-col" aria-hidden="true">
      <SkeletonBlock className="aspect-[16/10] w-full rounded-[4px]" />
      <div className="mt-3 flex flex-col gap-1.5">
        <SkeletonBlock className="h-3 w-24" />
        <SkeletonBlock className="h-5 w-full" />
        <SkeletonBlock className="h-5 w-4/5" />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <SkeletonBlock className="h-6 w-6 rounded-full" />
        <SkeletonBlock className="h-3 w-28" />
      </div>
    </div>
  );
}
