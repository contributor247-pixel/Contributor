import { SkeletonBlock } from "@/components/shared/SkeletonBlock";

// Mirrors ReaderSettingsPage's layout — the page does a real DB query
// (getPlatformConfig) with no client-side fallback, so under the
// intermittent Neon latency this session has repeatedly documented, a
// visitor previously sat on a near-blank page (confirmed via a
// throttled-network measurement: ~1.4s of an almost-empty shell before
// content appeared) with nothing to signal the page was loading.
export default function ReaderSettingsLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="border-b border-border/80 pb-5">
        <SkeletonBlock className="h-3 w-24 rounded-full" />
        <SkeletonBlock className="mt-2 h-8 w-56 rounded-lg" />
        <SkeletonBlock className="mt-1.5 h-3 w-72" />
      </div>

      <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-4">
          <SkeletonBlock className="h-14 w-14 shrink-0 rounded-full" />
          <div className="space-y-2">
            <SkeletonBlock className="h-5 w-40" />
            <SkeletonBlock className="h-3 w-48" />
            <SkeletonBlock className="h-4 w-20 rounded-full" />
          </div>
        </div>

        <div className="mt-8 border-t border-border/70 pt-6 space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between py-1">
              <SkeletonBlock className="h-4 w-28" />
              <SkeletonBlock className="h-4 w-36" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs">
        <SkeletonBlock className="h-4 w-32" />
        <SkeletonBlock className="mt-2 h-5 w-56" />
        <SkeletonBlock className="mt-1.5 h-3 w-full max-w-sm" />
      </div>
    </div>
  );
}
