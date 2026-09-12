import Link from "next/link";
import { ShoppingBag, CreditCard } from "lucide-react";
import { requireAuthForPage } from "@/lib/require-page-auth";
import { getReaderOverviewStats } from "@/lib/actions/dashboard-overview";

export default async function ReaderOverviewPage() {
  const session = await requireAuthForPage();
  const stats = await getReaderOverviewStats();

  const tiles = [
    { label: "Articles Purchased", value: stats.totalPurchases.toLocaleString(), icon: ShoppingBag },
    { label: "Active Subscriptions", value: stats.activeSubscriptions.toLocaleString(), icon: CreditCard },
  ];

  return (
    <div>
      <h1 className="mb-1 font-serif text-2xl font-semibold text-text-heading">
        Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}
      </h1>
      <p className="mb-6 text-sm text-text-muted">Your reading and subscriptions at a glance.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/content"
          className="flex h-11 items-center rounded-[4px] bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-primary"
        >
          Browse articles
        </Link>
        <Link
          href="/dashboard/reader/subscriptions"
          className="flex h-11 items-center rounded-[4px] border border-border-strong px-5 text-sm font-semibold text-text-body transition-colors hover:bg-bg-muted"
        >
          Manage subscriptions
        </Link>
      </div>
    </div>
  );
}
