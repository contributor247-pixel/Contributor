"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

// Shared refresh action for every dashboard table (Admin Users,
// Moderation, Categories, Author's My Articles, Reader's Purchases) —
// each page is a Server Component whose data comes from a fresh fetch
// on every render, so router.refresh() re-runs that fetch in place
// without a full page reload or losing scroll position. One component
// instead of five near-identical hand-rolled buttons, per the "don't
// duplicate the same control across pages" rule.
export function TableRefreshButton({ label = "Refresh" }: { label?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // Keeps the icon spinning through the transition's own brief tail
  // (route refresh completing, new data painting) rather than
  // snapping back to idle the instant router.refresh() is called.
  const [isSpinning, setIsSpinning] = useState(false);

  const handleRefresh = () => {
    setIsSpinning(true);
    startTransition(() => {
      router.refresh();
    });
    window.setTimeout(() => setIsSpinning(false), 600);
  };

  return (
    <button
      type="button"
      onClick={handleRefresh}
      disabled={isPending}
      aria-label={label}
      className="flex h-10 items-center gap-2 rounded-[4px] border border-border-strong px-3.5 text-sm font-medium text-text-body transition-colors hover:border-ink hover:bg-bg-muted disabled:cursor-not-allowed disabled:opacity-60"
    >
      <RefreshCw
        className={`h-3.5 w-3.5 shrink-0 ${isSpinning || isPending ? "animate-spin" : ""}`}
        aria-hidden="true"
      />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
