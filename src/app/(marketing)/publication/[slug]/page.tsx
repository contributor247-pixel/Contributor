import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Newspaper } from "lucide-react";
import { getPublicationBySlug, getPublicationArticleCards } from "@/lib/queries/publications";
import { ArticleCard } from "@/components/shared/ArticleCard";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { EmptyState } from "@/components/shared/EmptyState";
import { ScrollRevealGrid } from "@/components/shared/ScrollRevealGrid";
import { buildMetadata } from "@/lib/seo";

interface PublicationPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PublicationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const publication = await getPublicationBySlug(slug);
  if (!publication) return buildMetadata({ title: "Publication", description: "", path: `/publication/${slug}`, noIndex: true });

  return buildMetadata({
    title: publication.name,
    description: publication.description ?? `Read ${publication.name} on Contributor.`,
    path: `/publication/${publication.slug}`,
  });
}

export default async function PublicationPage({ params }: PublicationPageProps) {
  const { slug } = await params;
  const publication = await getPublicationBySlug(slug);
  if (!publication) notFound();

  const articles = await getPublicationArticleCards(publication.id);

  return (
    <div>
      <div className="bg-ink text-white">
        <div className="mx-auto flex max-w-[1320px] flex-col items-center px-4 py-16 text-center sm:px-6">
          {publication.coverImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- base64 cover
            <img
              src={publication.coverImageUrl}
              alt={publication.name}
              className="mb-6 h-24 w-24 rounded-full object-cover"
            />
          )}
          <h1 className="font-serif text-3xl font-semibold sm:text-4xl">{publication.name}</h1>
          {publication.description && (
            <p className="mt-3 max-w-xl text-sm text-white/80">{publication.description}</p>
          )}
          <p className="mt-4 text-xs uppercase tracking-wide text-white/60">
            Edited by {publication.ownerName ?? "Unknown"}
          </p>
        </div>
      </div>

      <SectionContainer>
        {articles.length === 0 ? (
          <EmptyState
            icon={Newspaper}
            headline="No articles yet"
            description="This Publication hasn't published any articles yet."
          />
        ) : (
          <ScrollRevealGrid className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} titleAs="h2" />
            ))}
          </ScrollRevealGrid>
        )}
      </SectionContainer>
    </div>
  );
}
