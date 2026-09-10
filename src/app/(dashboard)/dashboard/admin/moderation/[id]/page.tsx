import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRoleForPage } from "@/lib/require-page-auth";
import { getReportDetail } from "@/lib/actions/admin";
import { ReportActions } from "./ReportActions";

const REASON_LABEL: Record<string, string> = {
  spam: "Spam",
  harassment: "Harassment",
  copyright: "Copyright",
  misinformation: "Misinformation",
  other: "Other",
};

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRoleForPage("admin");
  const { id } = await params;
  const report = await getReportDetail(id);
  if (!report) notFound();

  const bodyHtml = (report.articleBody as { html?: string } | null)?.html ?? "";

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/dashboard/admin/moderation"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-body"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Moderation Queue
      </Link>

      <div className="mb-6 rounded-[4px] border border-border-strong p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
            {REASON_LABEL[report.reason] ?? report.reason}
          </span>
          <span className="text-xs text-text-muted">
            Reported by {report.reporterName ?? report.reporterEmail} on{" "}
            {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(report.createdAt)}
          </span>
        </div>
        {report.detail && <p className="mt-3 text-sm text-text-body">&ldquo;{report.detail}&rdquo;</p>}
      </div>

      <div className="mb-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.15em] text-text-muted">Reported Article</p>
        <h1 className="font-serif text-2xl font-semibold text-text-heading">{report.articleTitle}</h1>
        <p className="mt-1 text-sm text-text-muted">
          By {report.primaryAuthor?.name ?? "Unknown"} · Status: {report.articleStatus}
        </p>
      </div>

      <div
        className="prose-content mb-8 max-h-96 overflow-y-auto rounded-[4px] border border-border p-5 text-[0.9375rem] leading-[1.8] text-text-body"
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />

      <ReportActions
        reportId={report.id}
        articleId={report.articleId}
        authorUserId={report.primaryAuthor?.userId ?? null}
      />
    </div>
  );
}
