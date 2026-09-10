export default function AdminFeesLoading() {
  return (
    <div className="mx-auto max-w-2xl" aria-hidden="true">
      <div className="mb-6 h-8 w-40 animate-pulse rounded bg-bg-muted" />
      <div className="mb-6 h-16 animate-pulse rounded-[4px] bg-bg-muted" />
      <div className="mb-8">
        <div className="mb-4 h-6 w-64 animate-pulse rounded bg-bg-muted" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <div className="mb-1 h-3.5 w-40 animate-pulse rounded bg-bg-muted" />
              <div className="h-11 animate-pulse rounded-[4px] bg-bg-muted" />
            </div>
          ))}
        </div>
      </div>
      <div className="mb-8">
        <div className="mb-4 h-6 w-56 animate-pulse rounded bg-bg-muted" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i}>
              <div className="mb-1 h-3.5 w-20 animate-pulse rounded bg-bg-muted" />
              <div className="h-11 animate-pulse rounded-[4px] bg-bg-muted" />
            </div>
          ))}
        </div>
      </div>
      <div className="h-11 w-36 animate-pulse rounded-[4px] bg-bg-muted" />
    </div>
  );
}
