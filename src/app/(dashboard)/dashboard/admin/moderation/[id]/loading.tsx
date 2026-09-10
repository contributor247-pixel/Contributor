export default function ReportDetailLoading() {
  return (
    <div className="mx-auto max-w-3xl" aria-hidden="true">
      <div className="mb-6 h-4 w-40 animate-pulse rounded bg-bg-muted" />
      <div className="mb-6 animate-pulse rounded-[4px] border border-border-strong p-5">
        <div className="h-4 w-64 rounded bg-bg-muted" />
        <div className="mt-3 h-4 w-3/4 rounded bg-bg-muted" />
      </div>
      <div className="mb-6">
        <div className="mb-2 h-3 w-32 animate-pulse rounded bg-bg-muted" />
        <div className="h-7 w-2/3 animate-pulse rounded bg-bg-muted" />
        <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-bg-muted" />
      </div>
      <div className="mb-8 h-40 animate-pulse rounded-[4px] border border-border bg-bg-muted/40" />
      <div className="flex gap-3">
        <div className="h-10 w-24 animate-pulse rounded-[4px] bg-bg-muted" />
        <div className="h-10 w-36 animate-pulse rounded-[4px] bg-bg-muted" />
        <div className="h-10 w-32 animate-pulse rounded-[4px] bg-bg-muted" />
      </div>
    </div>
  );
}
