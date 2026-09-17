export default function AdminCategoriesLoading() {
  return (
    <div className="space-y-6" aria-hidden="true">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="h-5 w-36 animate-pulse rounded-full bg-bg-muted/80" />
            <div className="h-5 w-24 animate-pulse rounded-full bg-bg-muted/80" />
          </div>
          <div className="h-9 w-64 animate-pulse rounded-xl bg-bg-muted" />
          <div className="mt-2 h-4 w-96 max-w-full animate-pulse rounded-lg bg-bg-muted/70" />
        </div>

        <div className="h-9 w-24 animate-pulse rounded-full bg-bg-muted/80" />
      </div>

      {/* New Category Form Card Skeleton */}
      <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs space-y-4">
        <div>
          <div className="h-5 w-40 animate-pulse rounded bg-bg-muted" />
          <div className="mt-1 h-3 w-80 animate-pulse rounded bg-bg-muted/60" />
        </div>
        <div className="flex flex-col sm:flex-row items-start gap-3">
          <div className="h-10 w-full sm:max-w-md animate-pulse rounded-xl bg-bg-muted/80" />
          <div className="h-10 w-32 animate-pulse rounded-full bg-bg-muted/80" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-2xl border border-border/80 bg-surface shadow-xs overflow-hidden">
        <div className="border-b border-border/80 bg-bg-alt/50 px-6 py-3.5">
          <div className="flex items-center justify-between">
            <div className="h-3.5 w-28 animate-pulse rounded bg-bg-muted/80" />
            <div className="h-3.5 w-20 animate-pulse rounded bg-bg-muted/80" />
            <div className="h-3.5 w-16 animate-pulse rounded bg-bg-muted/80" />
            <div className="h-3.5 w-20 animate-pulse rounded bg-bg-muted/80" />
          </div>
        </div>

        <div className="divide-y divide-border/60">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-6 py-4">
              <div className="h-4 w-36 animate-pulse rounded bg-bg-muted" />
              <div className="h-4 w-24 animate-pulse rounded-md bg-bg-muted/60" />
              <div className="h-5 w-16 animate-pulse rounded-full bg-bg-muted/70" />
              <div className="h-7 w-24 animate-pulse rounded-full bg-bg-muted/80" />
            </div>
          ))}
        </div>

        <div className="border-t border-border/80 bg-bg-alt/30 px-6 py-3.5 flex items-center justify-between">
          <div className="h-3.5 w-48 animate-pulse rounded bg-bg-muted/70" />
          <div className="h-3 w-40 animate-pulse rounded bg-bg-muted/50" />
        </div>
      </div>
    </div>
  );
}
