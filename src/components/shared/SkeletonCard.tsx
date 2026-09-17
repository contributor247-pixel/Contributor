import { SkeletonBlock } from "./SkeletonBlock";

export function SkeletonCard() {
  return (
    <div className="flex flex-col rounded-2xl border border-border/80 bg-surface p-4 shadow-xs sm:p-5" aria-hidden="true">
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-border/60">
        <SkeletonBlock className="h-full w-full" />
        <div className="absolute left-3 top-3 h-5 w-20 rounded-full bg-ink/20" />
        <div className="absolute bottom-2.5 right-2.5 h-4 w-16 rounded-full bg-ink/20" />
      </div>
      <div className="mt-4 flex flex-1 flex-col">
        <div className="flex items-center justify-between">
          <SkeletonBlock className="h-3 w-28" />
          <SkeletonBlock className="h-3 w-16" />
        </div>
        <div className="mt-2.5 flex flex-col gap-1.5">
          <SkeletonBlock className="h-5 w-full" />
          <SkeletonBlock className="h-5 w-4/5" />
        </div>
        <div className="mt-2.5 flex flex-col gap-1">
          <SkeletonBlock className="h-3.5 w-full" />
          <SkeletonBlock className="h-3.5 w-3/4" />
        </div>
        <div className="mt-5 pt-4 flex items-center justify-between border-t border-border/70">
          <div className="flex items-center gap-2">
            <SkeletonBlock className="h-6.5 w-6.5 rounded-full" />
            <SkeletonBlock className="h-3.5 w-28" />
          </div>
          <SkeletonBlock className="h-7 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}


