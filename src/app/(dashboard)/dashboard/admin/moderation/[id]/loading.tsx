export default function ReportDetailLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-6" aria-hidden="true">
      {/* Back Button Skeleton */}
      <div className="h-8 w-48 animate-pulse rounded-full bg-bg-muted/80" />

      {/* Report Summary Card Skeleton */}
      <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-xl bg-bg-muted" />
            <div>
              <div className="h-4 w-40 animate-pulse rounded-full bg-bg-muted" />
              <div className="mt-1 h-3 w-32 animate-pulse rounded bg-bg-muted/60" />
            </div>
          </div>
          <div className="h-8 w-48 animate-pulse rounded-xl bg-bg-muted/80" />
        </div>

        <div className="h-16 animate-pulse rounded-xl bg-bg-muted/60" />
      </div>

      {/* Article Preview Card Skeleton */}
      <div className="rounded-2xl border border-border/80 bg-surface p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-border/80 pb-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-5 w-32 animate-pulse rounded-full bg-bg-muted/80" />
            <div className="h-5 w-24 animate-pulse rounded-full bg-bg-muted/60" />
          </div>
          <div className="h-8 w-3/4 animate-pulse rounded-xl bg-bg-muted" />
          <div className="mt-2 h-4 w-48 animate-pulse rounded bg-bg-muted/60" />
        </div>

        {/* Content Box Skeleton */}
        <div className="h-64 animate-pulse rounded-xl bg-bg-muted/40" />

        {/* Actions Bar Skeleton */}
        <div className="border-t border-border/80 pt-6">
          <div className="flex flex-wrap gap-3">
            <div className="h-9 w-44 animate-pulse rounded-full bg-bg-muted/80" />
            <div className="h-9 w-36 animate-pulse rounded-full bg-bg-muted/80" />
            <div className="h-9 w-40 animate-pulse rounded-full bg-bg-muted/80" />
          </div>
        </div>
      </div>
    </div>
  );
}
