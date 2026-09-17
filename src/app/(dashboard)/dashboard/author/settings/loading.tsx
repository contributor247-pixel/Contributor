import { SkeletonBlock } from "@/components/shared/SkeletonBlock";

// Mirrors AuthorSettingsPage's layout — requireVerifiedAuthorForPage()
// does a real DB round-trip before this page can render anything.
export default function AuthorSettingsLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="border-b border-border/80 pb-5">
        <SkeletonBlock className="h-3 w-32 rounded-full" />
        <SkeletonBlock className="mt-2 h-8 w-64 rounded-lg" />
        <SkeletonBlock className="mt-1.5 h-3 w-72" />
      </div>

      <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-4">
          <SkeletonBlock className="h-14 w-14 shrink-0 rounded-full" />
          <div className="space-y-2">
            <SkeletonBlock className="h-5 w-40" />
            <SkeletonBlock className="h-3 w-48" />
            <div className="flex gap-2">
              <SkeletonBlock className="h-4 w-20 rounded-full" />
              <SkeletonBlock className="h-4 w-24 rounded-full" />
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border/70 pt-6 space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between py-1">
              <SkeletonBlock className="h-4 w-32" />
              <SkeletonBlock className="h-4 w-36" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
