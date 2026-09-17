"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, EyeOff, UserX, RefreshCw } from "lucide-react";
import {
  dismissReportAction,
  unpublishArticleAction,
  suspendAuthorForReportAction,
} from "@/lib/actions/admin";
import { useToast } from "@/hooks/use-toast";
import { useConfirm } from "@/hooks/use-confirm";

interface ReportActionsProps {
  reportId: string;
  articleId: string;
  authorUserId: string | null;
}

export function ReportActions({ reportId, articleId, authorUserId }: ReportActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { show } = useToast();
  const confirm = useConfirm();

  const run = (
    successMessage: string,
    action: () => Promise<{ success: true } | { success: false; error: string }>
  ) => {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setError(result.error);
        return;
      }
      show(successMessage);
      router.push("/dashboard/admin/moderation");
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Dismiss Report */}
        <button
          type="button"
          onClick={() => run("Report dismissed with no action taken.", () => dismissReportAction(reportId))}
          disabled={isPending}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border/80 bg-surface px-5 py-2.5 text-xs font-semibold text-text-heading shadow-2xs transition-all hover:bg-bg-alt hover:border-border-strong disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5 text-text-muted" />}
          Dismiss Report (No Violation)
        </button>

        {/* Unpublish Article */}
        <button
          type="button"
          onClick={async () => {
            const confirmed = await confirm({
              title: "Unpublish this article immediately?",
              message: "The story will be removed from public discovery and search indexes. The author will be notified.",
              confirmLabel: "Unpublish Story",
            });
            if (!confirmed) return;
            run("Article has been unpublished.", () => unpublishArticleAction(reportId, articleId));
          }}
          disabled={isPending}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-5 py-2.5 text-xs font-semibold text-amber-700 dark:text-amber-300 shadow-2xs transition-all hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <EyeOff className="h-3.5 w-3.5" />}
          Unpublish Article
        </button>

        {/* Suspend Author */}
        {authorUserId && (
          <button
            type="button"
            onClick={async () => {
              const confirmed = await confirm({
                title: "Suspend this author's account?",
                message: "All of their published stories will be hidden immediately and publishing will be revoked. An email notice will be dispatched.",
                confirmLabel: "Suspend Author Account",
              });
              if (!confirmed) return;
              run("Author account suspended.", () => suspendAuthorForReportAction(reportId, authorUserId));
            }}
            disabled={isPending}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-xs font-semibold text-red-600 dark:text-red-400 shadow-2xs transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <UserX className="h-3.5 w-3.5" />}
            Suspend Author Account
          </button>
        )}
      </div>

      {isPending && (
        <p className="flex items-center gap-2 text-xs font-medium text-text-muted">
          <RefreshCw className="h-3 w-3 animate-spin" />
          Processing administrative action...
        </p>
      )}

      {error && (
        <p role="alert" className="text-xs font-medium text-error">
          {error}
        </p>
      )}
    </div>
  );
}
