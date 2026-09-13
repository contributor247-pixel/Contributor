// Mirrors InvitesPage's InvitesList (card-list of pending invites).
export default function InvitesLoading() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 h-8 w-24 animate-pulse rounded bg-bg-muted" />
      <ul className="flex flex-col gap-3">
        {[0, 1].map((i) => (
          <li key={i} className="flex items-center justify-between rounded-[4px] border border-border-strong p-4">
            <div className="flex flex-col gap-1.5">
              <div className="h-4 w-48 animate-pulse rounded bg-bg-muted" />
              <div className="h-3 w-24 animate-pulse rounded bg-bg-muted" />
            </div>
            <div className="h-9 w-20 animate-pulse rounded-[4px] bg-bg-muted" />
          </li>
        ))}
      </ul>
    </div>
  );
}
