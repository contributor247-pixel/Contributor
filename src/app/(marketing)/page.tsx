import type { Metadata } from "next";
import { Newspaper } from "lucide-react";
import { getRecentArticles } from "@/lib/queries/articles";
import { HomeHero } from "@/components/shared/HomeHero";
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

export default async function Home() {
  const recent = await getRecentArticles(24);

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

  return (
    <>
      <HomeHero featured={hero} rail={rail} />

      {gridA.length > 0 ? (
        <SectionContainer>
          <ScrollRevealGrid className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {gridA.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </ScrollRevealGrid>
        </SectionContainer>
      ) : (
        // Fewer than 5 articles exist past the hero+rail — nothing to
        // fill this grid yet. Rather than leave a large gap of plain
        // white space before the AuthorPro band, show an honest,
        // on-brand "more is coming" moment instead (see
        // MoreStoriesComingBand's own comment for the full rationale).
        <MoreStoriesComingBand />
      )}

      <SectionContainer>
        <AuthorProBand />
      </SectionContainer>

      {editorsFeatured && (
        <SectionContainer eyebrow="Curated" heading="Editor's Picks">
          <EditorsPicks featured={editorsFeatured} picks={editorsPicks} />
        </SectionContainer>
      )}

      {gridB.length > 0 && (
        <SectionContainer heading="More Stories">
          <ScrollRevealGrid className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {gridB.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </ScrollRevealGrid>
        </SectionContainer>
      )}

      {gridC.length > 0 && (
        <SectionContainer heading="Latest">
          <ScrollRevealGrid className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {gridC.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </ScrollRevealGrid>
        </SectionContainer>
      )}
    </>
  );
}
