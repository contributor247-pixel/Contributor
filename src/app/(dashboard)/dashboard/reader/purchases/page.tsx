import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { requireAuthForPage } from "@/lib/require-page-auth";
import { getMyPurchasesAction } from "@/lib/actions/dashboard-overview";
import { EmptyState } from "@/components/shared/EmptyState";

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function ReaderPurchasesPage() {
  await requireAuthForPage();
  const purchases = await getMyPurchasesAction();

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-semibold text-text-heading">Purchases</h1>

      {purchases.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          headline="No purchases yet"
          description="Articles you buy will show up here."
          cta={{ label: "Browse articles", href: "/content" }}
        />
      ) : (
        <div className="overflow-x-auto rounded-[4px] border border-border">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-muted text-left text-xs uppercase tracking-wide text-text-muted">
                <th className="px-4 py-3">Article</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-text-heading">
                    <Link href={`/article/${p.articleSlug}`} className="hover:underline">
                      {p.articleTitle}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-body">{formatCents(p.amountCents)}</td>
                  <td className="px-4 py-3 text-text-muted">
                    {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(p.createdAt)}
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
