"use client";

import { useSession, signOut } from "next-auth/react";
import { Menu } from "lucide-react";

// Basic functional shell for Step 3 — full visual polish (per
// docs/02_ThemeGuideline.md's dashboard responsive treatment) lands in
// Step 15's animation/polish pass. This intentionally stays simple:
// wordmark, mobile sidebar toggle, and account info/sign-out.
export function DashboardTopbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { data: session } = useSession();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Open sidebar"
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-[4px] text-text-body hover:bg-bg-muted lg:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <span className="font-serif text-lg font-semibold text-text-heading">Contributor</span>
      </div>
      {session?.user && (
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-text-muted sm:inline">{session.user.email}</span>
          <button
            type="button"
            onClick={() => signOut()}
            className="rounded-[4px] border border-border-strong px-3 py-1.5 text-text-body hover:bg-bg-muted"
          >
            Sign out
          </button>
        </div>
      )}
    </header>
  );
}
