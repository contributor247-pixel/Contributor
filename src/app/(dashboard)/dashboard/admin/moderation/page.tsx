import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { requireRoleForPage } from "@/lib/require-page-auth";
import { getModerationQueue } from "@/lib/actions/admin";
import { EmptyState } from "@/components/shared/EmptyState";

const REASON_LABEL: Record<string, string> = {
  spam: "Spam",
  harassment: "Harassment",
  copyright: "Copyright",
  misinformation: "Misinformation",
  other: "Other",
};

export default async function ModerationQueuePage() {
  await requireRoleForPage("admin");
  const reports = await getModerationQueue();

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-semibold text-text-heading">Moderation Queue</h1>

      {reports.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          headline="No open reports"
          description="Reported articles will show up here for review."
        />
      ) : (
        <div className="overflow-x-auto rounded-[4px] border border-border">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-muted text-left text-xs uppercase tracking-wide text-text-muted">
                <th className="px-4 py-3">Article</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Reported By</th>
                <th className="px-4 py-3">Reported</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-text-heading">{row.articleTitle}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
                      {REASON_LABEL[row.reason] ?? row.reason}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-body">{row.reporterName ?? row.reporterEmail}</td>
                  <td className="px-4 py-3 text-text-muted">
                    {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(row.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/admin/moderation/${row.id}`}
                      className="inline-flex min-h-11 items-center px-2 text-text-body underline-offset-2 hover:underline"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
