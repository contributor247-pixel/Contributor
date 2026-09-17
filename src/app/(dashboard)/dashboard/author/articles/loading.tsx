import { SkeletonBlock } from "@/components/shared/SkeletonBlock";

// Mirrors MyArticlesPage's table (Title/Status/Category/Created/Actions).
export default function MyArticlesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/80 pb-5">
        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-32 rounded-full" />
          <SkeletonBlock className="h-8 w-48 rounded-lg" />
          <SkeletonBlock className="h-3 w-80" />
        </div>
        <div className="flex gap-2">
          <SkeletonBlock className="h-9 w-9 rounded-full" />
          <SkeletonBlock className="h-9 w-32 rounded-full" />
        </div>
      </div>

      <div className="divide-y divide-border/60 rounded-2xl border border-border/80 bg-surface">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between p-5">
            <div className="space-y-2">
              <SkeletonBlock className="h-5 w-64" />
              <div className="flex gap-2">
                <SkeletonBlock className="h-4 w-20 rounded-full" />
                <SkeletonBlock className="h-4 w-24 rounded-full" />
              </div>
            </div>
            <div className="flex gap-2">
              <SkeletonBlock className="h-8 w-16 rounded-full" />
              <SkeletonBlock className="h-8 w-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
