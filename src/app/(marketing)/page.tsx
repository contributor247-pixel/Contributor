import Link from "next/link";
import type { Metadata } from "next";
import { Newspaper } from "lucide-react";
import { getRecentArticles } from "@/lib/queries/articles";
import { HomeHero } from "@/components/shared/HomeHero";
import { ArticleCard } from "@/components/shared/ArticleCard";
import { EditorsPicks } from "@/components/shared/EditorsPicks";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { EmptyState } from "@/components/shared/EmptyState";
import { ScrollRevealGrid } from "@/components/shared/ScrollRevealGrid";
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

      {gridA.length > 0 && (
        <SectionContainer>
          <ScrollRevealGrid className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {gridA.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </ScrollRevealGrid>
        </SectionContainer>
      )}

      <SectionContainer className="border-y border-border bg-bg-muted">
        <Link
          href="/dashboard/author"
          data-dark-surface
          className="flex flex-col items-center justify-between gap-4 rounded-[4px] bg-ink px-6 py-8 text-center text-white sm:flex-row sm:text-left"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">AuthorPro</p>
            <h2 className="mt-1 font-serif text-xl font-semibold">Write premium stories and earn from your work</h2>
          </div>
          <span className="shrink-0 rounded-[4px] bg-white px-5 py-2.5 text-sm font-semibold text-ink">
            Learn more
          </span>
        </Link>
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
