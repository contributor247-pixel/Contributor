import Link from "next/link";
import { FileText, CheckCircle2, DollarSign, Sparkles } from "lucide-react";
import { requireVerifiedAuthorForPage } from "@/lib/require-page-auth";
import { getAuthorOverviewStats } from "@/lib/actions/dashboard-overview";

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function AuthorOverviewPage() {
  const session = await requireVerifiedAuthorForPage();
  const stats = await getAuthorOverviewStats();

  const tiles = [
    { label: "Total Articles", value: stats.totalArticles.toLocaleString(), icon: FileText },
    { label: "Published", value: stats.publishedArticles.toLocaleString(), icon: CheckCircle2 },
    { label: "Revenue This Month", value: formatCents(stats.revenueThisMonthCents), icon: DollarSign },
  ];

  return (
    <div>
      <h1 className="mb-1 font-serif text-2xl font-semibold text-text-heading">
        Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}
      </h1>
      <p className="mb-6 text-sm text-text-muted">Here&apos;s how your writing is doing.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-[4px] border border-border-strong p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted">{tile.label}</p>
              <tile.icon className="h-4 w-4 text-text-muted" aria-hidden="true" />
            </div>
            <p className="mt-3 font-serif text-3xl font-semibold text-text-heading">{tile.value}</p>
          </div>
        ))}
      </div>

      {!stats.isAuthorPro && (
        <div className="mt-6 flex flex-col items-start gap-4 rounded-[4px] bg-ink p-6 text-white sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 shrink-0 text-primary-subtle" aria-hidden="true" />
            <div>
              <p className="font-serif text-lg font-semibold">Go Pro to publish Premium articles</p>
              <p className="mt-0.5 text-sm text-white/70">Unlock pay-per-article pricing and Publications.</p>
            </div>
          </div>
          <Link
            href="/dashboard/author/billing"
            className="shrink-0 rounded-[4px] bg-white px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-primary-subtle"
          >
            View plans
          </Link>
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/dashboard/author/articles/new"
          className="flex h-11 items-center rounded-[4px] bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-primary"
        >
          Write a new article
        </Link>
        <Link
          href="/dashboard/author/articles"
          className="flex h-11 items-center rounded-[4px] border border-border-strong px-5 text-sm font-semibold text-text-body transition-colors hover:bg-bg-muted"
        >
          View my articles
        </Link>
      </div>
    </div>
  );
}
