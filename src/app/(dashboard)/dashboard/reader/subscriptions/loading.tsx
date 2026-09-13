// Mirrors ReaderSubscriptionsPage's card-list + platform-access panel.
export default function ReaderSubscriptionsLoading() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-1 h-7 w-40 animate-pulse rounded bg-bg-muted" />
      <div className="mb-6 h-4 w-64 animate-pulse rounded bg-bg-muted" />
      <ul className="mb-8 flex flex-col gap-3">
        {[0, 1].map((i) => (
          <li key={i} className="rounded-[4px] border border-border-strong p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-bg-muted" />
              <div className="flex flex-col gap-1.5">
                <div className="h-4 w-40 animate-pulse rounded bg-bg-muted" />
                <div className="h-3 w-32 animate-pulse rounded bg-bg-muted" />
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="h-44 animate-pulse rounded-[4px] border border-border-strong" />
    </div>
  );
}
