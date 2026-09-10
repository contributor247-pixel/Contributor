import { FileQuestion } from "lucide-react";
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
}

export async function ArticleListingGrid({ page, basePath, categorySlug }: ArticleListingGridProps) {
  const { items, totalCount } = await getPaginatedArticles(page, PER_PAGE, categorySlug);
  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE));

  if (items.length === 0) {
    return (
      <EmptyState
        icon={FileQuestion}
        headline="No articles here yet"
        description="Check back soon, or explore a different topic."
        cta={{ label: "Browse all content", href: "/content" }}
      />
    );
  }

  return (
    <>
      <ScrollRevealGrid className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </ScrollRevealGrid>
      <Pagination currentPage={page} totalPages={totalPages} basePath={basePath} />
    </>
  );
}
