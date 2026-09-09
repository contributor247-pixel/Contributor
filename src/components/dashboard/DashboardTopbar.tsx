"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, LogOut } from "lucide-react";

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
        <Link href="/" className="font-serif text-lg font-semibold text-text-heading">
          Contributor
        </Link>
      </div>
      {session?.user && (
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2.5 sm:flex">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">
              {initials(session.user.name, session.user.email)}
            </span>
            <span className="max-w-[180px] truncate text-sm text-text-body">
              {session.user.name ?? session.user.email}
            </span>
          </div>
          <button
            type="button"
            aria-label="Sign out"
            onClick={() => signOut()}
            className="flex h-9 items-center gap-1.5 rounded-[4px] border border-border-strong px-3 text-sm text-text-body transition-colors hover:border-error hover:text-error"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      )}
    </header>
  );
}
