"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { verifyUserEmailAction, setUserStatusAction } from "@/lib/actions/admin";

interface UserRowActionsProps {
  userId: string;
  role: "reader" | "author" | "admin";
  status: "active" | "suspended";
  emailVerified: boolean;
}

export function UserRowActions({ userId, role, status, emailVerified }: UserRowActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleVerify = () => {
    setError(null);
    startTransition(async () => {
      const result = await verifyUserEmailAction(userId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  const handleToggleStatus = () => {
    const nextStatus = status === "active" ? "suspended" : "active";
    if (nextStatus === "suspended" && !window.confirm("Suspend this user? Their published articles will be hidden immediately.")) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await setUserStatusAction(userId, nextStatus);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  if (role === "admin") {
    return <span className="text-xs text-text-muted">—</span>;
  }

  return (
    <div className="flex items-center justify-end gap-3">
      {!emailVerified && (
        <button
          type="button"
          onClick={handleVerify}
          disabled={isPending}
          className="inline-flex min-h-11 items-center px-2 text-text-body underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
        >
          Verify
        </button>
      )}
      <button
        type="button"
        onClick={handleToggleStatus}
        disabled={isPending}
        className={
          status === "active"
            ? "inline-flex min-h-11 items-center px-2 text-error underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
            : "inline-flex min-h-11 items-center px-2 text-success underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
        }
      >
        {isPending ? "Working..." : status === "active" ? "Suspend" : "Unsuspend"}
      </button>
      {error && <span role="alert" className="text-xs text-error">{error}</span>}
    </div>
  );
}
