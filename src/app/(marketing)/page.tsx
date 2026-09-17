import type { Metadata } from "next";
import { Newspaper } from "lucide-react";
import { getRecentArticles, getPopularCategoryPills } from "@/lib/queries/articles";
import { HomeHero } from "@/components/shared/HomeHero";
import { TopicExplorerStrip } from "@/components/shared/TopicExplorerStrip";
import { ArticleCard } from "@/components/shared/ArticleCard";
import { EditorsPicks } from "@/components/shared/EditorsPicks";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { EmptyState } from "@/components/shared/EmptyState";
import { ScrollRevealGrid } from "@/components/shared/ScrollRevealGrid";
import { AuthorProBand } from "@/components/shared/AuthorProBand";
import { MoreStoriesComingBand } from "@/components/shared/MoreStoriesComingBand";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Independent Journalism, Discovered",
  description:
    "A publishing platform for writers and readers — free-to-read stories, Premium articles unlocked article by article, and Publications you can subscribe to.",
  path: "/",
});

// With no revalidate/dynamic directive, Next statically prerenders
// this page at build time and serves that exact snapshot until the
// next deploy — including a genuinely empty article list if the DB
// had a transient failure during that one build (confirmed happening:
// a production build here baked in "No articles published yet" and
// kept serving it indefinitely even though the DB had real published
// articles seconds later). Revalidating periodically keeps the static
// generation performance benefit while self-healing from exactly that
// case, and keeps the homepage's "recent articles" list reasonably
// fresh as new articles are published.
export const revalidate = 300;

export default async function Home() {
  const [recent, popularCategories] = await Promise.all([
    getRecentArticles(24),
    getPopularCategoryPills(10),
  ]);

  if (recent.length === 0) {
    return (
      <SectionContainer>
        <EmptyState
          icon={Newspaper}
          headline="No articles published yet"
          description="Once Authors start publishing, their stories will appear here."
        />
      </SectionContainer>
    );
  }

  const [hero, ...rest] = recent;
  const rail = rest.slice(0, 4);
  const gridA = rest.slice(4, 10);
  const editorsFeatured = rest[10];
  const editorsPicks = rest.slice(11, 15);
  const gridB = rest.slice(15, 21);
  const gridC = rest.slice(21, 24);

  // Every section below the AuthorPro band (Editor's Desk, Deep
  // Archive, Fresh Off The Press) needs its own slice of `rest` to be
  // non-empty before it renders. gridA already has an explicit
  // MoreStoriesComingBand fallback, but on a low-inventory site (few
  // published articles) editorsFeatured/gridB/gridC can ALL be empty
  // at once with nothing shown in their place — full sections just
  // vanish silently instead of the "more stories coming" moment the
  // component was built for. Showing the band once here, whenever
  // none of the three later sections have anything to show, covers
  // that gap without duplicating it under every individual section.
  const hasLaterSections = Boolean(editorsFeatured) || gridB.length > 0 || gridC.length > 0;

  return (
    <>
      {/* 1. Hero & Magazine Rail */}
      <HomeHero featured={hero} rail={rail} />

      {/* 2. Topic Explorer Filter Bar */}
      <TopicExplorerStrip categories={popularCategories} />

      {/* 3. Section 01: Curated Dispatches (Grid A) */}
      {gridA.length > 0 ? (
        <SectionContainer
          eyebrow="Chapter 01 &bull; Curated"
          heading="Featured Dispatches &amp; Deep Thought"
        >
          <ScrollRevealGrid className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {gridA.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </ScrollRevealGrid>
        </SectionContainer>
      ) : (
        <MoreStoriesComingBand />
      )}

      {/* 4. AuthorPro Showcase Band */}
      <SectionContainer>
        <AuthorProBand backdropImageUrl={hero.coverImageUrl} />
      </SectionContainer>

      {/* 5. Section 02: Editor's Desk (Bento Spotlight & Leaderboard) */}
      {editorsFeatured && (
        <SectionContainer
          eyebrow="Chapter 02 &bull; Editors' Desk"
          heading="Top Picks &amp; Cultural Dialogue"
        >
          <EditorsPicks featured={editorsFeatured} picks={editorsPicks} />
        </SectionContainer>
      )}

      {/* 6. Section 03: More Stories (Grid B) */}
      {gridB.length > 0 && (
        <SectionContainer
          eyebrow="Chapter 03 &bull; Deep Archive"
          heading="More From The Network"
        >
          <ScrollRevealGrid className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {gridB.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </ScrollRevealGrid>
        </SectionContainer>
      )}

      {/* 7. Section 04: Latest Updates (Grid C) */}
      {gridC.length > 0 && (
        <SectionContainer
          eyebrow="Chapter 04 &bull; Fresh Off The Press"
          heading="Latest Discoveries"
        >
          <ScrollRevealGrid className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {gridC.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </ScrollRevealGrid>
        </SectionContainer>
      )}

      {/* 8. Fallback: nothing past the AuthorPro band had enough
          content to render, and gridA already showed its own copy of
          this band above — showing it again here would be
          redundant, so only show it if gridA DID have content. */}
      {!hasLaterSections && gridA.length > 0 && <MoreStoriesComingBand />}
    </>
  );
}

