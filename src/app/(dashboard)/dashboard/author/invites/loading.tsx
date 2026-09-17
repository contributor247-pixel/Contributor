import { SkeletonBlock } from "@/components/shared/SkeletonBlock";

// Mirrors InvitesPage's InvitesList (card list of pending invites).
export default function InvitesLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="border-b border-border/80 pb-5 space-y-2">
        <SkeletonBlock className="h-4 w-28 rounded-full" />
        <SkeletonBlock className="h-8 w-56 rounded-lg" />
        <SkeletonBlock className="h-3 w-80" />
      </div>

      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-2xl border border-border/80 bg-surface p-5 shadow-xs"
          >
            <div className="space-y-2">
              <SkeletonBlock className="h-4 w-48" />
              <SkeletonBlock className="h-3 w-32" />
            </div>
            <div className="flex gap-2">
              <SkeletonBlock className="h-8 w-20 rounded-full" />
              <SkeletonBlock className="h-8 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
