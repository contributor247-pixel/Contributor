"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Ban, RefreshCw, Shield } from "lucide-react";
import { verifyUserEmailAction, setUserStatusAction } from "@/lib/actions/admin";
import { useConfirm } from "@/hooks/use-confirm";
import { useToast } from "@/hooks/use-toast";

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
  const confirm = useConfirm();
  const { show } = useToast();

  const handleVerify = () => {
    setError(null);
    startTransition(async () => {
      const result = await verifyUserEmailAction(userId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      show("User email verified successfully.");
      router.refresh();
    });
  };

  const handleToggleStatus = async () => {
    const nextStatus = status === "active" ? "suspended" : "active";
    if (nextStatus === "suspended") {
      const confirmed = await confirm({
        title: "Suspend this user account?",
        message: "Their published articles will be hidden immediately and they will be prevented from publishing.",
        confirmLabel: "Suspend Account",
      });
      if (!confirmed) return;
    }
    setError(null);
    startTransition(async () => {
      const result = await setUserStatusAction(userId, nextStatus);
      if (!result.success) {
        setError(result.error);
        return;
      }
      show(nextStatus === "suspended" ? "User account suspended." : "User account reactivated.");
      router.refresh();
    });
  };

  if (role === "admin") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-text-muted">
        <Shield className="h-3.5 w-3.5 text-primary" />
        Admin Protected
      </span>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {!emailVerified && (
        <button
          type="button"
          onClick={handleVerify}
          disabled={isPending}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border/80 bg-surface px-3 py-1 text-xs font-semibold text-text-body shadow-2xs transition-all hover:border-border-strong hover:bg-bg-alt hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
          )}
          Verify
        </button>
      )}

      <button
        type="button"
        onClick={handleToggleStatus}
        disabled={isPending}
        className={
          status === "active"
            ? "inline-flex min-h-11 items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-600 dark:text-red-400 shadow-2xs transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            : "inline-flex min-h-11 items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 shadow-2xs transition-all hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        }
      >
        {isPending ? (
          <RefreshCw className="h-3 w-3 animate-spin" />
        ) : (
          <Ban className="h-3 w-3" />
        )}
        {status === "active" ? "Suspend" : "Unsuspend"}
      </button>

      {error && (
        <span role="alert" className="text-xs text-error font-medium">
          {error}
        </span>
      )}
    </div>
  );
}
