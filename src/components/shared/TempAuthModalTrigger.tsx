"use client";

import { useSession, signOut } from "next-auth/react";
import { useAuthModal } from "@/hooks/use-auth-modal";

// Temporary: the real trigger lives in Navbar (Step 3). This exists only
// so AuthModal is manually testable before the navbar is built — remove
// once Step 3 wires the real Sign Up / Login nav buttons.
export function TempAuthModalTrigger() {
  const { open } = useAuthModal();
  const { data: session, status } = useSession();

  if (status === "authenticated") {
    return (
      <div className="fixed right-4 top-4 z-40 flex items-center gap-3 rounded-md bg-white p-3 text-sm shadow-md">
        <span>Signed in as {session.user?.email}</span>
        <button onClick={() => signOut()} className="underline">
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="fixed right-4 top-4 z-40 flex gap-2">
      <button
        onClick={() => open("login")}
        className="rounded-md bg-[#111114] px-4 py-2 text-sm text-white"
      >
        Login
      </button>
      <button
        onClick={() => open("signup")}
        className="rounded-md border border-[#111114] px-4 py-2 text-sm text-[#111114]"
      >
        Sign Up
      </button>
    </div>
  );
}
