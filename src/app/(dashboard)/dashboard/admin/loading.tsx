export default function AdminOverviewLoading() {
  return (
    <div>
      <div className="mb-6 h-8 w-48 animate-pulse rounded bg-bg-muted" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-[4px] border border-border-strong p-5">
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 rounded bg-bg-muted" />
              <div className="h-4 w-4 rounded bg-bg-muted" />
            </div>
            <div className="mt-3 h-8 w-16 rounded bg-bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
