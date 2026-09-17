export default function AdminOverviewLoading() {
  return (
    <div className="space-y-8" aria-hidden="true">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="h-5 w-32 animate-pulse rounded-full bg-bg-muted/80" />
            <div className="h-5 w-24 animate-pulse rounded-full bg-bg-muted/80" />
          </div>
          <div className="h-9 w-60 animate-pulse rounded-xl bg-bg-muted" />
          <div className="mt-2 h-4 w-96 max-w-full animate-pulse rounded-lg bg-bg-muted/70" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-40 animate-pulse rounded-full bg-bg-muted/80" />
          <div className="h-9 w-32 animate-pulse rounded-full bg-bg-muted" />
        </div>
      </div>

      {/* 4 Stat Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex flex-col justify-between rounded-2xl border border-border/80 bg-surface p-5 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 animate-pulse rounded-md bg-bg-muted/80" />
              <div className="h-9 w-9 animate-pulse rounded-xl bg-bg-muted/80" />
            </div>
            <div className="mt-4">
              <div className="h-8 w-28 animate-pulse rounded-lg bg-bg-muted" />
              <div className="mt-2 h-3 w-36 animate-pulse rounded-md bg-bg-muted/60" />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Navigation Hub Skeleton */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="h-6 w-56 animate-pulse rounded-lg bg-bg-muted" />
          <div className="h-4 w-20 animate-pulse rounded-md bg-bg-muted/60" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex flex-col justify-between rounded-2xl border border-border/80 bg-surface p-5 shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="h-11 w-11 animate-pulse rounded-xl bg-bg-muted/80" />
                  <div className="h-5 w-20 animate-pulse rounded-full bg-bg-muted/60" />
                </div>
                <div className="mt-4 h-5 w-40 animate-pulse rounded-lg bg-bg-muted" />
                <div className="mt-2 h-3.5 w-full animate-pulse rounded-md bg-bg-muted/70" />
              </div>
              <div className="mt-4 h-4 w-28 animate-pulse rounded-md bg-bg-muted/60" />
            </div>
          ))}
        </div>
      </div>

      {/* System Status Skeleton */}
      <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-bg-muted" />
            <div>
              <div className="h-4 w-64 animate-pulse rounded-md bg-bg-muted" />
              <div className="mt-1.5 h-3 w-80 max-w-full animate-pulse rounded-md bg-bg-muted/60" />
            </div>
          </div>
          <div className="h-6 w-36 animate-pulse rounded-full bg-bg-muted/80" />
        </div>
      </div>
    </div>
  );
}
