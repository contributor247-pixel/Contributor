import Link from "next/link";
import {
  ShoppingBag,
  CreditCard,
  Sparkles,
  BookOpen,
  Crown,
  ArrowRight,
  Clock,
  Compass,
  ArrowUpRight,
} from "lucide-react";
import { requireAuthForPage } from "@/lib/require-page-auth";
import {
  getReaderOverviewStats,
  getMyPurchasesAction,
} from "@/lib/actions/dashboard-overview";
import { getMyReaderSubscriptionsAction } from "@/lib/actions/subscription";
import { getRecentArticles } from "@/lib/queries/articles";
import { StatCard } from "@/components/dashboard/StatCard";
import { timeAgo } from "@/lib/time-ago";

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function ReaderOverviewPage() {
  const session = await requireAuthForPage();

  const [stats, purchases, subscriptions, recommended] = await Promise.all([
    getReaderOverviewStats(session?.user?.id),
    getMyPurchasesAction().catch(() => []),
    getMyReaderSubscriptionsAction().catch(() => []),
    getRecentArticles(3).catch(() => []),
  ]);

  const activePlatformSub = subscriptions.find(
    (s) => s.type === "platform" && s.status === "active"
  );
  const activePubSubs = subscriptions.filter(
    (s) => s.type === "publication" && s.status === "active"
  );

  const membershipStatus = activePlatformSub
    ? "Platform Member"
    : activePubSubs.length > 0
      ? `${activePubSubs.length} Publication${activePubSubs.length > 1 ? "s" : ""}`
      : "Free Reader";

  const tiles = [
    {
      label: "Articles Unlocked",
      value: stats.totalPurchases.toLocaleString(),
      icon: ShoppingBag,
    },
    {
      label: "Active Subscriptions",
      value: stats.activeSubscriptions.toLocaleString(),
      icon: CreditCard,
    },
    {
      label: "Membership Status",
      value: membershipStatus,
      icon: activePlatformSub ? Crown : Sparkles,
    },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Reader Library</span>
          </div>
          <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-text-heading sm:text-4xl">
            Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Your personal reading library, subscriptions, and unlocked dispatches at a glance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/content"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-primary-hover hover:shadow-sm"
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Discover Stories</span>
          </Link>
          <Link
            href="/dashboard/reader/subscriptions"
            className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-surface px-4 py-2.5 text-xs font-semibold text-text-heading transition-colors hover:border-primary/40 hover:text-primary"
          >
            <span>Subscriptions</span>
          </Link>
        </div>
      </div>

      {/* 2. Key Metrics Tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {tiles.map((tile) => (
          <StatCard
            key={tile.label}
            label={tile.label}
            value={tile.value}
            icon={tile.icon}
          />
        ))}
      </div>

      {/* 3. Platform Membership Banner (if not subscribed to platform pass) */}
      {!activePlatformSub && (
        <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/15 via-primary/5 to-surface p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                <Crown className="h-3 w-3" />
                <span>Unlimited Pass</span>
              </span>
              <h3 className="mt-2 font-serif text-xl font-semibold text-text-heading sm:text-2xl">
                Unlock Every Dispatch on Contributor
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-text-muted sm:text-sm">
                Enjoy unlimited access to all Premium essays and publication mastheads without per-article purchases.
              </p>
            </div>
            <Link
              href="/dashboard/reader/subscriptions"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-xs font-semibold text-white shadow-md transition-all hover:bg-primary"
            >
              <span>View Platform Access</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* 4. Two-Column Dashboard Split: Recent Unlocked Dispatches + Recommended */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Recently Unlocked Articles */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-primary" />
              <h2 className="font-serif text-lg font-semibold text-text-heading">
                Recently Unlocked Dispatches
              </h2>
            </div>
            <Link
              href="/dashboard/reader/purchases"
              className="text-xs font-medium text-primary hover:underline"
            >
              View All ({purchases.length}) &rarr;
            </Link>
          </div>

          {purchases.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/90 bg-surface/40 p-8 text-center">
              <BookOpen className="h-8 w-8 text-text-muted" />
              <p className="mt-3 font-serif text-base font-semibold text-text-heading">
                No Unlocked Articles Yet
              </p>
              <p className="mt-1 max-w-xs text-xs text-text-muted">
                Premium essays and stories you unlock will appear in your permanent library here.
              </p>
              <Link
                href="/content"
                className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary transition-all hover:bg-primary hover:text-white"
              >
                <span>Browse Stories</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border/60 rounded-2xl border border-border/80 bg-surface shadow-xs">
              {purchases.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="group flex flex-col gap-2 p-4 transition-colors hover:bg-bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/article/${item.articleSlug}`}
                      className="font-serif text-sm font-semibold text-text-heading transition-colors group-hover:text-primary"
                    >
                      {item.articleTitle}
                    </Link>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-text-muted">
                      <span>Unlocked {timeAgo(item.createdAt)}</span>
                      <span>&bull;</span>
                      <span className="font-mono font-medium text-text-body">
                        {formatCents(item.amountCents)}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/article/${item.articleSlug}`}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/80 bg-surface px-3.5 py-1.5 text-xs font-medium text-text-heading transition-all group-hover:border-primary/40 group-hover:text-primary shadow-xs"
                  >
                    <span>Read</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Curated Recommendations / Editors' Desk */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-supportive" />
              <h2 className="font-serif text-lg font-semibold text-text-heading">
                Recommended to Read
              </h2>
            </div>
            <Link
              href="/content"
              className="text-xs font-medium text-primary hover:underline"
            >
              Explore &rarr;
            </Link>
          </div>

          <div className="divide-y divide-border/60 rounded-2xl border border-border/80 bg-surface shadow-xs">
            {recommended.map((item, idx) => (
              <Link
                key={item.slug}
                href={`/article/${item.slug}`}
                className="group block p-4 transition-colors hover:bg-bg-muted/40"
              >
                <div className="flex items-center gap-2 text-[10px] font-medium text-text-muted">
                  <span className="font-serif font-bold text-supportive">
                    0{idx + 1}
                  </span>
                  <span>&bull;</span>
                  <span className="font-semibold text-text-body">{item.category.name}</span>
                  {item.isPremium && (
                    // Same contrast fix as the single-article page's
                    // Premium badge — text-supportive only reaches
                    // ~3.2:1 against this pale tinted background.
                    <span className="rounded-full bg-supportive/15 px-2 py-0.2 text-[9px] font-semibold uppercase text-[#a15804]">
                      Premium
                    </span>
                  )}
                </div>
                <h4 className="mt-1.5 font-serif text-sm font-semibold leading-snug text-text-heading transition-colors group-hover:text-primary">
                  {item.title}
                </h4>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
