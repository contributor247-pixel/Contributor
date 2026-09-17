import { SkeletonBlock } from "@/components/shared/SkeletonBlock";

// Mirrors ReaderPurchasesPage's luxury list layout
export default function ReaderPurchasesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/80 pb-5">
        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-28 rounded-full" />
          <SkeletonBlock className="h-8 w-60 rounded-lg" />
          <SkeletonBlock className="h-3 w-80" />
        </div>
        <SkeletonBlock className="h-9 w-9 rounded-full" />
      </div>

      <div className="divide-y divide-border/60 rounded-2xl border border-border/80 bg-surface">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between p-5">
            <div className="space-y-2">
              <SkeletonBlock className="h-5 w-64" />
              <div className="flex gap-2">
                <SkeletonBlock className="h-4 w-24" />
                <SkeletonBlock className="h-4 w-16" />
              </div>
            </div>
            <SkeletonBlock className="h-8 w-28 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
