import { Users, FileText, ShieldAlert, DollarSign } from "lucide-react";
import { requireRoleForPage } from "@/lib/require-page-auth";
import { getAdminOverviewStats } from "@/lib/actions/admin";

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function AdminOverviewPage() {
  await requireRoleForPage("admin");
  const stats = await getAdminOverviewStats();

  const tiles = [
    { label: "Total Users", value: stats.totalUsers.toLocaleString(), icon: Users },
    { label: "Published Articles", value: stats.totalPublishedArticles.toLocaleString(), icon: FileText },
    { label: "Open Reports", value: stats.openReports.toLocaleString(), icon: ShieldAlert, alert: stats.openReports > 0 },
    { label: "Revenue This Month", value: formatCents(stats.revenueThisMonthCents), icon: DollarSign },
  ];

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-semibold text-text-heading">Admin Overview</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-[4px] border border-border-strong p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted">{tile.label}</p>
              <tile.icon
                className={tile.alert ? "h-4 w-4 text-error" : "h-4 w-4 text-text-muted"}
                aria-hidden="true"
              />
            </div>
            <p className="mt-3 font-serif text-3xl font-semibold text-text-heading">{tile.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
