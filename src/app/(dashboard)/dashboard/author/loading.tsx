// Mirrors AuthorOverviewPage's stat-tile grid, matching the existing
// Admin overview loading pattern (src/app/(dashboard)/dashboard/admin/loading.tsx).
export default function AuthorOverviewLoading() {
  return (
    <div>
      <div className="mb-1 h-7 w-64 animate-pulse rounded bg-bg-muted" />
      <div className="mb-6 h-4 w-56 animate-pulse rounded bg-bg-muted" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="animate-pulse rounded-[4px] border border-border-strong p-5">
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 rounded bg-bg-muted" />
              <div className="h-4 w-4 rounded bg-bg-muted" />
            </div>
            <div className="mt-3 h-8 w-16 rounded bg-bg-muted" />
          </div>
        ))}
      </div>
      <div className="mt-8 flex gap-3">
        <div className="h-11 w-44 animate-pulse rounded-[4px] bg-bg-muted" />
        <div className="h-11 w-36 animate-pulse rounded-[4px] bg-bg-muted" />
      </div>
    </div>
  );
}
