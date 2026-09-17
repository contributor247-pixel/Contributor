import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldAlert, User, Calendar, FileText, AlertTriangle, CheckCircle2 } from "lucide-react";
import { requireRoleForPage } from "@/lib/require-page-auth";
import { getReportDetail } from "@/lib/actions/admin";
import { ReportActions } from "./ReportActions";

const REASON_LABEL: Record<string, string> = {
  spam: "Spam",
  harassment: "Harassment",
  copyright: "Copyright Violation",
  misinformation: "Misinformation",
  other: "Other Policy Violation",
};

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRoleForPage("admin");
  const { id } = await params;
  const report = await getReportDetail(id);
  if (!report) notFound();

  const bodyHtml = (report.articleBody as { html?: string } | null)?.html ?? "";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Back Navigation */}
      <div>
        <Link
          href="/dashboard/admin/moderation"
          className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface px-4 py-2 text-xs font-semibold text-text-heading shadow-2xs transition-all hover:bg-bg-alt hover:border-border-strong hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Moderation Queue
        </Link>
      </div>

      {/* Report Summary Card */}
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-amber-500/15 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:text-amber-200">
                  <AlertTriangle className="h-3 w-3" />
                  {REASON_LABEL[report.reason] ?? report.reason}
                </span>
                <span className="text-xs font-mono text-text-muted">
                  Report #{report.id.slice(0, 8)}
                </span>
              </div>
              <p className="mt-1 text-xs text-text-muted">
                Filed on{" "}
                {new Intl.DateTimeFormat("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(report.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-text-body bg-surface/80 rounded-xl px-3 py-2 border border-border/60">
            <User className="h-4 w-4 text-text-muted" />
            <span>
              Reported by{" "}
              <strong className="text-text-heading">
                {report.reporterName || "Anonymous"}
              </strong>{" "}
              ({report.reporterEmail})
            </span>
          </div>
        </div>

        {report.detail ? (
          <div className="mt-4 rounded-xl bg-surface/80 border border-border/60 p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted block mb-1">
              Reporter Notes &amp; Claim:
            </span>
            <p className="text-sm leading-relaxed text-text-heading italic">
              &ldquo;{report.detail}&rdquo;
            </p>
          </div>
        ) : (
          <p className="mt-3 text-xs text-text-muted">
            No additional written details were attached to this report.
          </p>
        )}
      </div>

      {/* Reported Article Content Preview Card */}
      <div className="rounded-2xl border border-border/80 bg-surface p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-border/80 pb-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              <FileText className="h-3 w-3" />
              Article Under Review
            </span>
            <span className="inline-flex items-center rounded-full bg-bg-alt px-2.5 py-0.5 text-xs font-medium text-text-muted capitalize">
              Status: {report.articleStatus}
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-text-heading">
            {report.articleTitle}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-text-muted">
            <span>
              Author:{" "}
              <strong className="text-text-heading">
                {report.primaryAuthor?.name ?? "Unknown Author"}
              </strong>
            </span>
            {report.primaryAuthor?.userId && (
              <span className="font-mono text-[11px] bg-bg-alt px-2 py-0.5 rounded">
                User ID: {report.primaryAuthor.userId.slice(0, 8)}...
              </span>
            )}
          </div>
        </div>

        {/* Article Body Preview */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
            Article Content Preview:
          </h2>
          <div
            className="prose-content max-h-[420px] overflow-y-auto rounded-xl border border-border/80 bg-bg-alt/30 p-5 text-sm leading-relaxed text-text-body"
            dangerouslySetInnerHTML={{ __html: bodyHtml || "<p class='italic text-text-muted'>No HTML content rendered.</p>" }}
          />
        </div>

        {/* Action Decision Footer — the action buttons only ever make
            sense on an open report. Rendering them unconditionally let
            an admin dismiss/unpublish/suspend on top of a report
            that's already been resolved, with no indication anything
            had already happened (confirmed via a real double-dismiss
            test: the DB correctly recorded the first action, but this
            page still offered all three buttons on a repeat visit). */}
        <div className="border-t border-border/80 pt-6">
          {report.status === "open" ? (
            <>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
                Take Administrative Action:
              </h2>
              <ReportActions
                reportId={report.id}
                articleId={report.articleId}
                authorUserId={report.primaryAuthor?.userId ?? null}
              />
            </>
          ) : (
            <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-bg-alt/50 px-4 py-3 text-sm text-text-body">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
              <span>
                This report was already{" "}
                <strong className="font-semibold text-text-heading">
                  {report.adminActionTaken === "unpublished"
                    ? "actioned — the article was unpublished"
                    : report.adminActionTaken === "author_suspended"
                      ? "actioned — the author was suspended"
                      : "dismissed"}
                </strong>
                {report.actionedAt &&
                  ` on ${new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(report.actionedAt)}`}
                . No further action is needed.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
