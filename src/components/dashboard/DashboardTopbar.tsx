"use client";

import { useSession, signOut } from "next-auth/react";
import { Menu, LogOut } from "lucide-react";
import { NotificationBell } from "./NotificationBell";

function initials(name: string | null | undefined, email: string | null | undefined): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || parts[0]?.[0]?.toUpperCase() || "?";
  }
  return email?.[0]?.toUpperCase() ?? "?";
}

export function DashboardTopbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { data: session } = useSession();

  return (
    // z-30, not z-20: the notification dropdown below is a child of
    // this header's own stacking context (it's `sticky` + a z-index,
    // which creates one), so its z-40 only wins against siblings
    // *inside* this header — not against the editor page's own sticky
    // publish-settings toolbar (ArticleForm.tsx), which is a SIBLING
    // stacking context also at z-20 and painted after this header in
    // DOM order. At equal z-index, later-painted siblings win,
    // letting that toolbar draw over an open notification dropdown.
    // Raising the header's own z-index lifts its entire subtree above
    // that sibling context instead of just raising a value that
    // never actually competed against it.
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface/95 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Open sidebar"
          onClick={onMenuClick}
          className="flex h-11 w-11 items-center justify-center rounded-[4px] text-text-body hover:bg-bg-muted lg:hidden transition-colors"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <a href="/" className="flex items-center lg:hidden transition-opacity hover:opacity-80">
          {/* eslint-disable-next-line @next/next/no-img-element -- static asset */}
          <img src="/logo/logo.png" alt="Contributor" className="h-6 w-auto" />
        </a>
      </div>
      <span className="hidden lg:block" aria-hidden="true" />
      {session?.user && (
        <div className="flex items-center gap-2 sm:gap-3">
          <NotificationBell />
          <div
            title={session.user.name ?? session.user.email ?? "Account"}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-xs font-semibold text-text-heading shadow-xs transition-colors hover:border-primary/40 cursor-pointer"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
              {initials(session.user.name, session.user.email)}
            </span>
          </div>
          <button
            type="button"
            aria-label="Sign out"
            onClick={() => signOut()}
            className="flex h-11 items-center gap-1.5 rounded-full border border-border/80 bg-surface px-3.5 text-xs font-medium text-text-body transition-colors hover:border-error hover:text-error"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      )}
    </header>
  );
}
