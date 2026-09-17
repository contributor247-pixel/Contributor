import Link from "next/link";
import { FileQuestion, Sparkles, Filter } from "lucide-react";
import { getPaginatedArticles } from "@/lib/queries/articles";
import { ArticleCard } from "@/components/shared/ArticleCard";
import { Pagination } from "@/components/shared/Pagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { ScrollRevealGrid } from "@/components/shared/ScrollRevealGrid";

const PER_PAGE = 12;

interface ArticleListingGridProps {
  page: number;
  basePath: string;
  categorySlug?: string;
  categoryName?: string;
}

export async function ArticleListingGrid({ page, basePath, categorySlug, categoryName }: ArticleListingGridProps) {
  const { items, totalCount } = await getPaginatedArticles(page, PER_PAGE, categorySlug);
  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE));

  if (items.length === 0) {
    return (
      <EmptyState
        icon={FileQuestion}
        headline={page > 1 ? "No more stories on this page" : "No articles found"}
        description={
          page > 1
            ? `You've reached page ${page}, but only ${totalPages} page${totalPages === 1 ? "" : "s"} exist for this collection.`
            : "Check back soon, or explore a different topic."
        }
        cta={
          page > 1
            ? { label: "Return to Page 1", href: basePath }
            : { label: "Browse all content", href: "/content" }
        }
      />
    );
  }

  const startIdx = (page - 1) * PER_PAGE + 1;
  const endIdx = Math.min(page * PER_PAGE, totalCount);

  return (
    <div>
      {/* Catalog Metadata & Status Bar */}
      <div className="mb-8 flex flex-col justify-between gap-3 border-b border-border/70 pb-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
          <span className="font-semibold uppercase tracking-[0.16em] text-text-heading">
            Live Catalog
          </span>
          <span aria-hidden="true">&bull;</span>
          <span>
            Showing <strong className="font-semibold text-text-heading">{startIdx}&ndash;{endIdx}</strong> of{" "}
            <strong className="font-semibold text-text-heading">{totalCount}</strong> dispatches
          </span>
          {categorySlug && (
            <>
              <span aria-hidden="true">&bull;</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                <Filter className="h-3 w-3" />
                <span>{categoryName ?? categorySlug}</span>
              </span>
              <Link
                href="/content"
                className="text-[11px] text-text-muted underline underline-offset-2 hover:text-primary transition-colors"
              >
                (Clear filter)
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
          <span>Page</span>
          <span className="rounded-md border border-border/80 bg-bg px-2 py-0.5 font-semibold text-text-heading">
            {page} / {totalPages}
          </span>
        </div>
      </div>

      {/* Grid of Articles */}
      <ScrollRevealGrid className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((article) => (
          <ArticleCard key={article.slug} article={article} titleAs="h2" />
        ))}
      </ScrollRevealGrid>

      {/* Luxury Pagination */}
      <Pagination currentPage={page} totalPages={totalPages} basePath={basePath} />
    </div>
  );
}
