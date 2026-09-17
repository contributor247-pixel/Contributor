export default function AdminFeesLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-6" aria-hidden="true">
      {/* Header Skeleton */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <div className="h-5 w-40 animate-pulse rounded-full bg-bg-muted/80" />
          <div className="h-5 w-24 animate-pulse rounded-full bg-bg-muted/80" />
        </div>
        <div className="h-9 w-64 animate-pulse rounded-xl bg-bg-muted" />
        <div className="mt-2 h-4 w-96 max-w-full animate-pulse rounded-lg bg-bg-muted/70" />
      </div>

      {/* Notice Banner Skeleton */}
      <div className="h-16 animate-pulse rounded-2xl bg-bg-muted/60" />

      {/* Section 1 Skeleton */}
      <div className="rounded-2xl border border-border/80 bg-surface p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <div className="h-6 w-52 animate-pulse rounded-lg bg-bg-muted" />
          <div className="mt-1 h-3.5 w-80 animate-pulse rounded bg-bg-muted/60" />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-bg-muted/50" />
          ))}
        </div>
      </div>

      {/* Section 2 Skeleton */}
      <div className="rounded-2xl border border-border/80 bg-surface p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <div className="h-6 w-52 animate-pulse rounded-lg bg-bg-muted" />
          <div className="mt-1 h-3.5 w-80 animate-pulse rounded bg-bg-muted/60" />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-bg-muted/50" />
          ))}
        </div>
      </div>

      {/* Section 3 Skeleton */}
      <div className="rounded-2xl border border-border/80 bg-surface p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-6 w-60 animate-pulse rounded-lg bg-bg-muted" />
          <div className="h-6 w-24 animate-pulse rounded-full bg-bg-muted/80" />
        </div>
        <div className="h-3 w-full animate-pulse rounded-full bg-bg-muted/60" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="h-20 animate-pulse rounded-xl bg-bg-muted/50" />
          <div className="h-20 animate-pulse rounded-xl bg-bg-muted/50" />
        </div>
      </div>

      {/* Save Button Skeleton */}
      <div className="flex justify-end pt-4">
        <div className="h-11 w-48 animate-pulse rounded-full bg-bg-muted/80" />
      </div>
    </div>
  );
}
