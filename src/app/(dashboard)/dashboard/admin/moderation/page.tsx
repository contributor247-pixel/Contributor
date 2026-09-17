import Link from "next/link";
import {
  ShieldAlert,
  FileText,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  User,
  Clock,
} from "lucide-react";
import { requireRoleForPage } from "@/lib/require-page-auth";
import { getModerationQueue } from "@/lib/actions/admin";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableRefreshButton } from "@/components/shared/TableRefreshButton";

const REASON_LABEL: Record<string, string> = {
  spam: "Spam",
  harassment: "Harassment",
  copyright: "Copyright Violation",
  misinformation: "Misinformation",
  other: "Other Policy Violation",
};

function getReasonBadge(reason: string) {
  const label = REASON_LABEL[reason] ?? reason;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
      <AlertTriangle className="h-3 w-3" />
      {label}
    </span>
  );
}

export default async function ModerationQueuePage() {
  await requireRoleForPage("admin");
  const reports = await getModerationQueue();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              INTEGRITY &amp; TRUST
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                reports.length > 0
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold border border-amber-500/30"
                  : "bg-surface border border-border/80 text-text-muted"
              }`}
            >
              {reports.length} {reports.length === 1 ? "Open Report" : "Open Reports"}
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-text-heading">
            Moderation Queue
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Inspect reported articles, review flagged claims, and enforce platform guidelines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TableRefreshButton />
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-2xl border border-border/80 bg-surface p-12 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 mb-4">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h3 className="font-serif text-xl font-bold text-text-heading">
            All Clear — Moderation Queue Empty
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-muted">
            There are no pending reports or flagged articles requiring moderator review at this time.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/80 bg-surface shadow-xs overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border/80 bg-bg-alt/50 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  <th className="py-3.5 pl-6 pr-4">Reported Article</th>
                  <th className="py-3.5 px-4">Reason</th>
                  <th className="py-3.5 px-4">Reported By</th>
                  <th className="py-3.5 px-4">Date Filed</th>
                  <th className="py-3.5 pl-4 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {reports.map((row) => (
                  <tr
                    key={row.id}
                    className="group transition-colors hover:bg-bg-alt/40"
                  >
                    {/* Article Title */}
                    <td className="py-4 pl-6 pr-4">
                      <div className="flex items-start gap-3 max-w-md">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-text-heading group-hover:text-primary transition-colors line-clamp-1">
                            {row.articleTitle}
                          </div>
                          {row.detail && (
                            <p className="mt-0.5 text-xs text-text-muted line-clamp-1 italic">
                              &ldquo;{row.detail}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Reason */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {getReasonBadge(row.reason)}
                    </td>

                    {/* Reporter */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bg-alt text-text-muted">
                          <User className="h-3 w-3" />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-text-heading">
                            {row.reporterName || "Anonymous"}
                          </div>
                          <div className="text-[11px] text-text-muted font-mono">
                            {row.reporterEmail}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Reported Date */}
                    <td className="py-4 px-4 whitespace-nowrap text-xs text-text-muted">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-text-muted/70" />
                        {new Intl.DateTimeFormat("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(row.createdAt)}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 pl-4 pr-6 text-right whitespace-nowrap">
                      <Link
                        href={`/dashboard/admin/moderation/${row.id}`}
                        className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-primary transition-all"
                      >
                        Review
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden divide-y divide-border/60">
            {reports.map((row) => (
              <div key={row.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="font-semibold text-text-heading text-sm line-clamp-2">
                    {row.articleTitle}
                  </div>
                  {getReasonBadge(row.reason)}
                </div>

                {row.detail && (
                  <p className="text-xs text-text-muted bg-bg-alt p-2.5 rounded-xl italic">
                    &ldquo;{row.detail}&rdquo;
                  </p>
                )}

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40 text-xs">
                  <span className="text-text-muted">
                    Reported by {row.reporterName || row.reporterEmail}
                  </span>
                  <Link
                    href={`/dashboard/admin/moderation/${row.id}`}
                    className="inline-flex min-h-11 items-center gap-1 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white hover:bg-primary"
                  >
                    Review
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Footer */}
          <div className="border-t border-border/80 bg-bg-alt/30 px-6 py-3.5 text-xs text-text-muted">
            <span>
              Total <strong className="text-text-heading">{reports.length}</strong> flagged items
              awaiting administrative decision.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
