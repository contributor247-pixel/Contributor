import Link from "next/link";
import {
  Users,
  FileText,
  ShieldAlert,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Percent,
  Tags,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { requireRoleForPage } from "@/lib/require-page-auth";
import { getAdminOverviewStats } from "@/lib/actions/admin";
import { StatCard } from "@/components/dashboard/StatCard";

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function AdminOverviewPage() {
  await requireRoleForPage("admin");
  const stats = await getAdminOverviewStats();

  const tiles = [
    {
      label: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      trend: "Registered accounts",
    },
    {
      label: "Published Articles",
      value: stats.totalPublishedArticles.toLocaleString(),
      icon: FileText,
      trend: "Live across platform",
    },
    {
      label: "Open Reports",
      value: stats.openReports.toLocaleString(),
      icon: ShieldAlert,
      alert: stats.openReports > 0,
      trend: stats.openReports > 0 ? "Requires review" : "Queue clear",
    },
    {
      label: "Revenue This Month",
      value: formatCents(stats.revenueThisMonthCents),
      icon: DollarSign,
      trend: "Gross volume",
    },
  ];

  const quickLinks = [
    {
      title: "User Management",
      desc: "Search, verify email addresses, and manage account statuses.",
      href: "/dashboard/admin/users",
      icon: Users,
      badge: `${stats.totalUsers} Users`,
    },
    {
      title: "Moderation Queue",
      desc: "Inspect reported articles, review flagged content, and take action.",
      href: "/dashboard/admin/moderation",
      icon: ShieldAlert,
      badge: stats.openReports > 0 ? `${stats.openReports} Pending` : "Clear",
      badgeAlert: stats.openReports > 0,
    },
    {
      title: "Fee & Pricing Config",
      desc: "Configure subscriptions, article paywalls, and revenue splits.",
      href: "/dashboard/admin/settings/fees",
      icon: Percent,
      badge: "Platform Rates",
    },
    {
      title: "Taxonomy & Categories",
      desc: "Organize discovery topics, add new categories, and deprecate old tags.",
      href: "/dashboard/admin/settings/categories",
      icon: Tags,
      badge: "Discovery",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              SYSTEM CONTROL
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-surface border border-border/80 px-2.5 py-0.5 text-xs text-text-muted">
              <ShieldCheck className="h-3.5 w-3.5 text-success" />
              Admin Portal
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-text-heading">
            Admin Overview
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Real-time platform metrics, content moderation queue, and system configuration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/admin/moderation"
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all shadow-xs ${
              stats.openReports > 0
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 animate-pulse"
                : "bg-surface text-text-body border border-border/80 hover:bg-bg-alt"
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            Moderation Queue ({stats.openReports})
          </Link>
          <Link
            href="/dashboard/admin/users"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary transition-all"
          >
            <Users className="h-4 w-4" />
            Manage Users
          </Link>
        </div>
      </div>

      {/* Primary Key Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <StatCard
            key={tile.label}
            label={tile.label}
            value={tile.value}
            icon={tile.icon}
            alert={tile.alert}
            trend={tile.trend}
          />
        ))}
      </div>

      {/* Quick Navigation Hub */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold tracking-tight text-text-heading">
            Admin Operations &amp; Settings
          </h2>
          <span className="text-xs font-medium text-text-muted">Direct Access</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-surface p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-bg-alt text-text-heading group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        item.badgeAlert
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold"
                          : "bg-bg-alt text-text-muted"
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="mt-4 font-serif text-lg font-semibold text-text-heading group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-text-muted">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-text-heading group-hover:text-primary transition-colors">
                  <span>Open workspace</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* System Status & Integrity Card */}
      <div className="rounded-2xl border border-border/80 bg-gradient-to-r from-surface via-surface to-bg-alt p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-heading">
                Platform Services &amp; Ledgers Operational
              </h3>
              <p className="text-xs text-text-muted">
                Drizzle ORM, Stripe webhooks, and authentication services are active and synced.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
              <CheckCircle2 className="h-3.5 w-3.5" />
              All Systems Healthy
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
