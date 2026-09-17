import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  DollarSign,
  Sparkles,
  PenLine,
  BookOpen,
  ArrowRight,
  ArrowUpRight,
  Clock,
  Layers,
} from "lucide-react";
import { requireVerifiedAuthorForPage } from "@/lib/require-page-auth";
import { getAuthorOverviewStats } from "@/lib/actions/dashboard-overview";
import { getPlatformConfig } from "@/lib/queries/subscriptions";
import { StatCard } from "@/components/dashboard/StatCard";
import { db } from "@/lib/db";
import { articles, articleAuthors, categories } from "../../../../../drizzle/schema/index";
import { eq, desc } from "drizzle-orm";
import { timeAgo } from "@/lib/time-ago";

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default async function AuthorOverviewPage() {
  const session = await requireVerifiedAuthorForPage();
  const stats = await getAuthorOverviewStats();
  const config = await getPlatformConfig();
  const authorSplitPct = config?.standaloneAuthorSplitPct ?? 80;

  const recentArticles = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      status: articles.status,
      categoryName: categories.name,
      createdAt: articles.createdAt,
    })
    .from(articleAuthors)
    .innerJoin(articles, eq(articleAuthors.articleId, articles.id))
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .where(eq(articleAuthors.userId, session!.user.id))
    .orderBy(desc(articles.createdAt))
    .limit(4)
    .catch(() => []);

  const tiles = [
    {
      label: "Total Articles",
      value: stats.totalArticles.toLocaleString(),
      icon: FileText,
    },
    {
      label: "Published Dispatches",
      value: stats.publishedArticles.toLocaleString(),
      icon: CheckCircle2,
    },
    {
      label: "Revenue This Month",
      value: formatCents(stats.revenueThisMonthCents),
      icon: DollarSign,
      trend: stats.isAuthorPro ? `${authorSplitPct}% Direct Split` : undefined,
    },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <div className="flex flex-col gap-4 border-b border-border/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <PenLine className="h-3.5 w-3.5" />
            <span>Author Studio</span>
          </div>
          <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-text-heading sm:text-4xl">
            Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Track your dispatches, editorial performance, and creator earnings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/dashboard/author/articles/new"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-primary-hover hover:shadow-sm"
          >
            <PenLine className="h-3.5 w-3.5" />
            <span>Write New Article</span>
          </Link>
          <Link
            href="/dashboard/author/articles"
            className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-surface px-4 py-2.5 text-xs font-semibold text-text-heading transition-colors hover:border-primary/40 hover:text-primary"
          >
            <span>My Articles</span>
          </Link>
        </div>
      </div>

      {/* 2. Key Metrics Tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((tile) => (
          <StatCard
            key={tile.label}
            label={tile.label}
            value={tile.value}
            icon={tile.icon}
            trend={tile.trend}
          />
        ))}
      </div>

      {/* 3. AuthorPro Upgrade / Status Banner */}
      {!stats.isAuthorPro ? (
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-ink p-6 text-white shadow-lg sm:p-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_140%_at_50%_0%,rgba(139,30,63,0.35),transparent_65%)]"
          />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-supportive-subtle">
                <Sparkles className="h-3 w-3 text-supportive" />
                <span>AuthorPro Membership</span>
              </span>
              <h3 className="mt-2 font-serif text-xl font-semibold text-white sm:text-2xl">
                Unlock Micro-Paywalls &amp; Publication Mastheads
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-white/75 sm:text-sm">
                Set custom per-article prices, launch multi-author publications, and earn {authorSplitPct}% direct revenue splits.
              </p>
            </div>
            <Link
              href="/dashboard/author/billing"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-semibold text-ink shadow-md transition-all hover:bg-primary-subtle"
            >
              <span>Upgrade to AuthorPro</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="font-serif text-sm font-semibold text-text-heading">
                AuthorPro Active
              </p>
              <p className="text-xs text-text-muted">
                You have full access to premium paywalls and multi-writer publications.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/author/billing"
            className="text-xs font-medium text-primary hover:underline"
          >
            Billing &rarr;
          </Link>
        </div>
      )}

      {/* 4. Two-Column Dashboard Split: Recent Dispatches + Quick Studio Actions */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Recent Articles List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <h2 className="font-serif text-lg font-semibold text-text-heading">
                Recent Dispatches
              </h2>
            </div>
            <Link
              href="/dashboard/author/articles"
              className="text-xs font-medium text-primary hover:underline"
            >
              View All ({stats.totalArticles}) &rarr;
            </Link>
          </div>

          {recentArticles.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/90 bg-surface/40 p-8 text-center">
              <FileText className="h-8 w-8 text-text-muted" />
              <p className="mt-3 font-serif text-base font-semibold text-text-heading">
                No Articles Written Yet
              </p>
              <p className="mt-1 max-w-xs text-xs text-text-muted">
                Create your first investigative essay or commentary and publish to our readers.
              </p>
              <Link
                href="/dashboard/author/articles/new"
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-primary-hover"
              >
                <PenLine className="h-3.5 w-3.5" />
                <span>Write First Article</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border/60 rounded-2xl border border-border/80 bg-surface shadow-xs">
              {recentArticles.map((art) => (
                <div
                  key={art.id}
                  className="group flex flex-col gap-2 p-4 transition-colors hover:bg-bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/dashboard/author/articles/${art.id}/edit`}
                      className="font-serif text-sm font-semibold text-text-heading transition-colors group-hover:text-primary"
                    >
                      {art.title}
                    </Link>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-text-muted">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.2 text-[10px] font-semibold uppercase ${
                          art.status === "published"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-surface-muted text-text-muted border border-border/60"
                        }`}
                      >
                        {art.status}
                      </span>
                      <span>&bull;</span>
                      <span>{art.categoryName}</span>
                      <span>&bull;</span>
                      <span>{timeAgo(art.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/author/articles/${art.id}/edit`}
                      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border/80 bg-surface px-3 py-1 text-xs font-medium text-text-heading transition-all group-hover:border-primary/40 group-hover:text-primary"
                    >
                      <span>Edit</span>
                    </Link>
                    {art.status === "published" && (
                      <Link
                        href={`/article/${art.slug}`}
                        target="_blank"
                        className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-white"
                      >
                        <span>View</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Quick Studio Navigation */}
        <div className="lg:col-span-4 space-y-4">
          <div className="border-b border-border/70 pb-3">
            <h2 className="font-serif text-lg font-semibold text-text-heading">
              Studio Actions
            </h2>
          </div>

          <div className="space-y-3">
            <Link
              href="/dashboard/author/publications"
              className="group flex items-center justify-between rounded-2xl border border-border/80 bg-surface p-4 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-semibold text-text-heading">
                    Publications
                  </h4>
                  <p className="text-xs text-text-muted">Manage your shared mastheads</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-text-muted transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/dashboard/author/billing"
              className="group flex items-center justify-between rounded-2xl border border-border/80 bg-surface p-4 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <DollarSign className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-semibold text-text-heading">
                    Billing &amp; Payouts
                  </h4>
                  <p className="text-xs text-text-muted">Stripe connect &amp; revenue splits</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-text-muted transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/dashboard/author/invites"
              className="group flex items-center justify-between rounded-2xl border border-border/80 bg-surface p-4 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-semibold text-text-heading">
                    Invites &amp; Collabs
                  </h4>
                  <p className="text-xs text-text-muted">Publication team invitations</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-text-muted transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
