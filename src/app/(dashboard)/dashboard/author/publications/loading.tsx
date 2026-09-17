import { SkeletonBlock } from "@/components/shared/SkeletonBlock";

// Mirrors PublicationsPage's responsive cards grid.
export default function PublicationsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/80 pb-5">
        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-28 rounded-full" />
          <SkeletonBlock className="h-8 w-52 rounded-lg" />
          <SkeletonBlock className="h-3 w-80" />
        </div>
        <SkeletonBlock className="h-9 w-36 rounded-full" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs space-y-4"
          >
            <div className="flex items-start justify-between">
              <SkeletonBlock className="h-11 w-11 rounded-xl" />
              <SkeletonBlock className="h-5 w-20 rounded-full" />
            </div>
            <SkeletonBlock className="h-5 w-40" />
            <SkeletonBlock className="h-3 w-full" />
            <div className="pt-4 border-t border-border/60 flex justify-between">
              <SkeletonBlock className="h-3 w-20" />
              <SkeletonBlock className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
