// Mirrors BillingPage's status card + GoProSection block.
export default function BillingLoading() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 h-8 w-28 animate-pulse rounded bg-bg-muted" />
      <div className="mb-6 rounded-[4px] border border-border-strong p-6">
        <div className="h-3 w-32 animate-pulse rounded bg-bg-muted" />
        <div className="mt-3 h-6 w-40 animate-pulse rounded bg-bg-muted" />
        <div className="mt-2 h-4 w-56 animate-pulse rounded bg-bg-muted" />
      </div>
      <div className="h-40 animate-pulse rounded-[4px] border border-border-strong" />
    </div>
  );
}
