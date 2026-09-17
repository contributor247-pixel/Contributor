import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Newspaper, Crown } from "lucide-react";
import { getPublicationBySlug, getPublicationArticleCards } from "@/lib/queries/publications";
import { getPlatformConfig } from "@/lib/queries/subscriptions";
import { auth } from "@/lib/auth";
import { getMyReaderSubscriptionsAction, hasActivePlatformSubscription } from "@/lib/actions/subscription";
import { ArticleCard } from "@/components/shared/ArticleCard";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { EmptyState } from "@/components/shared/EmptyState";
import { ScrollRevealGrid } from "@/components/shared/ScrollRevealGrid";
import { SubscribeButton } from "@/components/billing/SubscribeButton";
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

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function PublicationPage({ params }: PublicationPageProps) {
  const { slug } = await params;
  const publication = await getPublicationBySlug(slug);
  if (!publication) notFound();

  const session = await auth();

  const [articles, config, readerSubs, hasPlatformSub] = await Promise.all([
    getPublicationArticleCards(publication.id),
    getPlatformConfig(),
    session?.user ? getMyReaderSubscriptionsAction().catch(() => []) : Promise.resolve([]),
    session?.user ? hasActivePlatformSubscription(session.user.id) : Promise.resolve(false),
  ]);

  // Only AuthorPro users can OWN a Publication, but anyone (including
  // an Author browsing as a reader) can subscribe to one — this button
  // is for the "buy access" side of the relationship, not authorship,
  // so it's shown to any signed-in visitor who isn't already the Owner.
  const isOwner = session?.user?.id === publication.ownerId;
  const activeSubToThisPublication = readerSubs.find(
    (s) => s.type === "publication" && s.publicationId === publication.id && s.status === "active"
  );
  const showSubscribeCard = !isOwner && !activeSubToThisPublication && config;

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

          {showSubscribeCard && (
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <SubscribeButton
                type="publication"
                interval="monthly"
                publicationId={publication.id}
                label={`Subscribe — ${formatCents(config.publicationSubMonthlyCents)}/mo`}
                // Section 6's supersede rule: a Reader already on the
                // Platform pass already has this Publication's Premium
                // content included, so subscribing here would be a
                // redundant additional charge — warn but don't block.
                confirmMessage={
                  hasPlatformSub
                    ? `You already have an active Platform All-Access subscription, which already includes ${publication.name}. Subscribing here would be a redundant additional charge. Continue anyway?`
                    : undefined
                }
                className="h-11 rounded-full bg-white px-6 text-sm font-semibold text-ink shadow-md transition-all hover:bg-primary-subtle hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              />
              <SubscribeButton
                type="publication"
                interval="yearly"
                publicationId={publication.id}
                label={`Yearly — ${formatCents(config.publicationSubYearlyCents)}/yr`}
                confirmMessage={
                  hasPlatformSub
                    ? `You already have an active Platform All-Access subscription, which already includes ${publication.name}. Subscribing here would be a redundant additional charge. Continue anyway?`
                    : undefined
                }
                className="h-11 rounded-full border border-white/30 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/15 hover:border-white/50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          )}

          {hasPlatformSub && !activeSubToThisPublication && !isOwner && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-supportive-subtle">
              <Crown className="h-3.5 w-3.5" aria-hidden="true" />
              Already included in your Platform All-Access pass
            </p>
          )}

          {activeSubToThisPublication && (
            <p className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-medium text-white/90">
              You&apos;re subscribed to {publication.name}
            </p>
          )}
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
