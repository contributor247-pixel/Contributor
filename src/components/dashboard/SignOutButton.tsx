"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut()}
      className="flex h-11 items-center gap-1.5 rounded-[4px] border border-border-strong px-4 text-sm font-semibold text-text-body transition-colors hover:border-error hover:text-error"
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      Sign out
    </button>
  );
}
