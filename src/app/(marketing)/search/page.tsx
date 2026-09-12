import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import { searchArticles } from "@/lib/queries/articles";
import { ArticleCard } from "@/components/shared/ArticleCard";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { EmptyState } from "@/components/shared/EmptyState";
import { ScrollRevealGrid } from "@/components/shared/ScrollRevealGrid";
import { buildMetadata } from "@/lib/seo";

// noIndex: search-results pages are thin/duplicate content by nature
// and shouldn't be indexed individually — the query itself has no
// stable canonical value worth ranking.
export const metadata: Metadata = buildMetadata({
  title: "Search",
  description: "Search Contributor's published articles.",
  path: "/search",
  noIndex: true,
});

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q ?? "";
  const results = query.trim() ? await searchArticles(query, 24) : [];

  return (
    <SectionContainer headingLevel="h1" heading={query.trim() ? `Search results for "${query}"` : "Search"}>
      {!query.trim() ? (
        <p className="text-text-muted">Enter a search term to find articles.</p>
      ) : results.length === 0 ? (
        <EmptyState
          icon={SearchX}
          headline={`No results for "${query}"`}
          description="Try a different keyword or browse all content instead."
          cta={{ label: "Browse all content", href: "/content" }}
        />
      ) : (
        <ScrollRevealGrid className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((article) => (
            <ArticleCard key={article.slug} article={article} titleAs="h2" />
          ))}
        </ScrollRevealGrid>
      )}
    </SectionContainer>
  );
}
