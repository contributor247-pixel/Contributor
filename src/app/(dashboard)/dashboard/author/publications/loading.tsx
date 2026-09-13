// Mirrors PublicationsPage's card-list (not a table).
export default function PublicationsLoading() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-44 animate-pulse rounded bg-bg-muted" />
        <div className="h-10 w-40 animate-pulse rounded-[4px] bg-bg-muted" />
      </div>
      <ul className="flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <li key={i} className="flex items-center justify-between rounded-[4px] border border-border-strong p-4">
            <div className="flex flex-col gap-1.5">
              <div className="h-4 w-40 animate-pulse rounded bg-bg-muted" />
              <div className="h-3 w-20 animate-pulse rounded bg-bg-muted" />
            </div>
            <div className="h-4 w-16 animate-pulse rounded bg-bg-muted" />
          </li>
        ))}
      </ul>
    </div>
  );
}
