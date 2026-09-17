import { SkeletonBlock } from "@/components/shared/SkeletonBlock";

// Mirrors AuthorOverviewPage's header, 3 metric tiles, AuthorPro banner, and two-column layout.
export default function AuthorOverviewLoading() {
  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <div className="flex flex-col gap-4 border-b border-border/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-32 rounded-full" />
          <SkeletonBlock className="h-8 w-64 rounded-lg" />
          <SkeletonBlock className="h-4 w-80" />
        </div>
        <div className="flex gap-2.5">
          <SkeletonBlock className="h-9 w-36 rounded-full" />
          <SkeletonBlock className="h-9 w-28 rounded-full" />
        </div>
      </div>

      {/* 2. 3 Metrics Tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <SkeletonBlock className="h-3 w-28" />
              <SkeletonBlock className="h-8 w-8 rounded-xl" />
            </div>
            <SkeletonBlock className="h-8 w-20" />
          </div>
        ))}
      </div>

      {/* 3. AuthorPro Banner Skeleton */}
      <div className="rounded-3xl border border-primary/20 bg-ink p-8 space-y-4">
        <SkeletonBlock variant="dark" className="h-5 w-36 rounded-full" />
        <SkeletonBlock variant="dark" className="h-8 w-80" />
        <SkeletonBlock variant="dark" className="h-4 w-full max-w-md" />
      </div>

      {/* 4. Two-Column Split */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <SkeletonBlock className="h-5 w-48" />
            <SkeletonBlock className="h-4 w-20" />
          </div>
          <div className="divide-y divide-border/60 rounded-2xl border border-border/80 bg-surface">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div className="space-y-2">
                  <SkeletonBlock className="h-4 w-56" />
                  <SkeletonBlock className="h-3 w-32" />
                </div>
                <SkeletonBlock className="h-7 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 lg:col-span-4">
          <div className="border-b border-border/70 pb-3">
            <SkeletonBlock className="h-5 w-36" />
          </div>
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-2xl border border-border/80 bg-surface p-4 flex items-center gap-3">
                <SkeletonBlock className="h-9 w-9 rounded-xl" />
                <div className="space-y-1.5 flex-1">
                  <SkeletonBlock className="h-4 w-28" />
                  <SkeletonBlock className="h-3 w-40" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
