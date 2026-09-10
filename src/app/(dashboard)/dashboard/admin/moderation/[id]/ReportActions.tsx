"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  dismissReportAction,
  unpublishArticleAction,
  suspendAuthorForReportAction,
} from "@/lib/actions/admin";

interface ReportActionsProps {
  reportId: string;
  articleId: string;
  authorUserId: string | null;
}

export function ReportActions({ reportId, articleId, authorUserId }: ReportActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const run = (
    label: string,
    action: () => Promise<{ success: true } | { success: false; error: string }>
  ) => {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push("/dashboard/admin/moderation");
      router.refresh();
    });
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => run("dismiss", () => dismissReportAction(reportId))}
          disabled={isPending}
          className="h-10 rounded-[4px] border border-border-strong px-4 text-sm font-semibold text-text-body transition-colors hover:bg-bg-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          Dismiss
        </button>
        <button
          type="button"
          onClick={() => {
            if (!window.confirm("Unpublish this article? It will be hidden from public view immediately.")) return;
            run("unpublish", () => unpublishArticleAction(reportId, articleId));
          }}
          disabled={isPending}
          className="h-10 rounded-[4px] border border-warning bg-warning/10 px-4 text-sm font-semibold text-warning transition-colors hover:bg-warning/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Unpublish Article
        </button>
        {authorUserId && (
          <button
            type="button"
            onClick={() => {
              if (!window.confirm("Suspend this author? All of their published articles will be hidden immediately.")) return;
              run("suspend", () => suspendAuthorForReportAction(reportId, authorUserId));
            }}
            disabled={isPending}
            className="h-10 rounded-[4px] border border-error bg-error/10 px-4 text-sm font-semibold text-error transition-colors hover:bg-error/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Suspend Author
          </button>
        )}
      </div>
      {isPending && <p className="mt-2 text-xs text-text-muted">Working...</p>}
      {error && <p className="mt-2 text-sm text-error">{error}</p>}
    </div>
  );
}
