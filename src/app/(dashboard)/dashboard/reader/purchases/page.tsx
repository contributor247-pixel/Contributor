import Link from "next/link";
import {
  ShoppingBag,
  ArrowUpRight,
  BookOpen,
  Clock,
  Sparkles,
  Receipt,
  FileText,
} from "lucide-react";
import { requireAuthForPage } from "@/lib/require-page-auth";
import { getMyPurchasesAction } from "@/lib/actions/dashboard-overview";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableRefreshButton } from "@/components/shared/TableRefreshButton";
import { timeAgo } from "@/lib/time-ago";

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function ReaderPurchasesPage() {
  await requireAuthForPage();
  const purchases = await getMyPurchasesAction().catch(() => []);

  const totalSpendCents = purchases.reduce((sum, p) => sum + (p.amountCents ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Unlocked Stories</span>
          </div>
          <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-text-heading">
            Purchases &amp; Library
          </h1>
          <p className="mt-0.5 text-xs text-text-muted">
            All individual essays and dispatches you have permanently unlocked on Contributor.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-full border border-border/80 bg-surface px-3.5 py-1.5 text-xs text-text-muted sm:flex items-center gap-1.5">
            <Receipt className="h-3.5 w-3.5 text-primary" />
            <span>Total: <strong>{purchases.length}</strong> dispatches ({formatCents(totalSpendCents)})</span>
          </div>
          <TableRefreshButton />
        </div>
      </div>

      {/* 2. Main Purchases Table / Ledger */}
      {purchases.length === 0 ? (
        <div className="rounded-2xl border border-border/80 bg-surface p-10 text-center">
          <EmptyState
            icon={ShoppingBag}
            headline="No unlocked articles yet"
            description="Premium essays and investigative reports you unlock will appear here with lifetime reading access."
            cta={{ label: "Explore Stories", href: "/content" }}
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-surface shadow-xs">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border/80 bg-surface-muted/60 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                  <th scope="col" className="px-6 py-4">
                    Article Dispatch
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Date Unlocked
                  </th>
                  <th scope="col" className="px-6 py-4 text-right">
                    Amount Paid
                  </th>
                  <th scope="col" className="px-6 py-4 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {purchases.map((p) => (
                  <tr
                    key={p.id}
                    className="group transition-colors hover:bg-primary/[0.03]"
                  >
                    {/* Column 1: Article Title & Link */}
                    <td className="max-w-md px-6 py-4">
                      <Link
                        href={`/article/${p.articleSlug}`}
                        className="font-serif text-sm font-semibold text-text-heading transition-colors group-hover:text-primary block"
                      >
                        {p.articleTitle}
                      </Link>
                      <span className="mt-0.5 inline-block text-[11px] text-text-muted">
                        Permanent lifetime unlock
                      </span>
                    </td>

                    {/* Column 2: Date Unlocked */}
                    <td className="whitespace-nowrap px-6 py-4 text-xs text-text-muted">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-text-muted/70" />
                        <span className="font-medium text-text-body">
                          {new Intl.DateTimeFormat("en-US", {
                            dateStyle: "medium",
                          }).format(p.createdAt)}
                        </span>
                      </div>
                      <span className="text-[11px] text-text-muted">
                        {timeAgo(p.createdAt)}
                      </span>
                    </td>

                    {/* Column 3: Amount Paid */}
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <span className="inline-flex items-center rounded-full border border-border/70 bg-surface-muted px-2.5 py-0.5 font-mono text-xs font-semibold text-text-heading">
                        {formatCents(p.amountCents)}
                      </span>
                    </td>

                    {/* Column 4: Read Action Pill */}
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <Link
                        href={`/article/${p.articleSlug}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary transition-all group-hover:bg-primary group-hover:text-white shadow-xs"
                      >
                        <span>Read</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border/80 bg-surface-muted/30 text-xs text-text-muted">
                  <td colSpan={2} className="px-6 py-3.5 font-medium">
                    Showing {purchases.length} unlocked dispatch{purchases.length === 1 ? "" : "es"}
                  </td>
                  <td colSpan={2} className="px-6 py-3.5 text-right font-medium">
                    Total Invested: <span className="font-mono font-semibold text-text-heading">{formatCents(totalSpendCents)}</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Mobile Card-List View */}
          <div className="divide-y divide-border/60 md:hidden">
            {purchases.map((p) => (
              <div
                key={p.id}
                className="p-4 transition-colors hover:bg-bg-muted/40 space-y-3"
              >
                <div>
                  <Link
                    href={`/article/${p.articleSlug}`}
                    className="font-serif text-sm font-semibold text-text-heading"
                  >
                    {p.articleTitle}
                  </Link>
                  <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
                    <span>{timeAgo(p.createdAt)}</span>
                    <span>&bull;</span>
                    <span className="font-mono font-semibold text-text-heading">
                      {formatCents(p.amountCents)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link
                    href={`/article/${p.articleSlug}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary"
                  >
                    <span>Read Article</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
