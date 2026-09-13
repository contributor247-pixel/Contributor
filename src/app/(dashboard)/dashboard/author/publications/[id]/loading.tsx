// Mirrors ManagePublicationPage's header + PublicationManagementTabs.
export default function ManagePublicationLoading() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-1 h-8 w-56 animate-pulse rounded bg-bg-muted" />
      <div className="mb-6 h-4 w-72 animate-pulse rounded bg-bg-muted" />
      <div className="mb-6 flex gap-2 border-b border-border">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-9 w-24 animate-pulse rounded-t-[4px] bg-bg-muted" />
        ))}
      </div>
      <div className="h-48 w-full animate-pulse rounded-[4px] bg-bg-muted" />
    </div>
  );
}
