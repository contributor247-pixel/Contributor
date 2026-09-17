import { SkeletonBlock } from "@/components/shared/SkeletonBlock";

// Mirrors ReaderSubscriptionsPage's luxury card list and platform pass panel.
export default function ReaderSubscriptionsLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="border-b border-border/80 pb-5 space-y-2">
        <SkeletonBlock className="h-4 w-32 rounded-full" />
        <SkeletonBlock className="h-8 w-64 rounded-lg" />
        <SkeletonBlock className="h-4 w-80" />
      </div>

      <div className="space-y-4">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SkeletonBlock className="h-12 w-12 rounded-2xl" />
                <div className="space-y-2">
                  <SkeletonBlock className="h-5 w-48" />
                  <SkeletonBlock className="h-3 w-36" />
                </div>
              </div>
              <SkeletonBlock className="h-7 w-28 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Platform Pass Banner Skeleton */}
      <div className="rounded-3xl border border-primary/20 bg-ink p-8 space-y-4">
        <SkeletonBlock variant="dark" className="h-5 w-36 rounded-full" />
        <SkeletonBlock variant="dark" className="h-8 w-80" />
        <SkeletonBlock variant="dark" className="h-4 w-full max-w-md" />
        <div className="flex gap-3 pt-4">
          <SkeletonBlock variant="dark" className="h-12 flex-1 rounded-full" />
          <SkeletonBlock variant="dark" className="h-12 flex-1 rounded-full" />
        </div>
      </div>
    </div>
  );
}
