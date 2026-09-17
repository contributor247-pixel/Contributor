import { SkeletonBlock } from "@/components/shared/SkeletonBlock";

// Mirrors BillingPage's header, status card, and GoProSection upgrade panel.
export default function BillingLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="border-b border-border/80 pb-5 space-y-2">
        <SkeletonBlock className="h-4 w-32 rounded-full" />
        <SkeletonBlock className="h-8 w-56 rounded-lg" />
        <SkeletonBlock className="h-4 w-80" />
      </div>

      <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <SkeletonBlock className="h-5 w-40" />
          <SkeletonBlock className="h-6 w-24 rounded-full" />
        </div>
        <SkeletonBlock className="h-4 w-48" />
        <SkeletonBlock className="h-3 w-64" />
      </div>

      <div className="rounded-3xl border border-border/80 bg-surface p-6 space-y-4">
        <SkeletonBlock className="h-6 w-44" />
        <SkeletonBlock className="h-4 w-72" />
        <div className="flex gap-3 pt-4">
          <SkeletonBlock className="h-11 flex-1 rounded-full" />
          <SkeletonBlock className="h-11 flex-1 rounded-full" />
        </div>
      </div>
    </div>
  );
}
