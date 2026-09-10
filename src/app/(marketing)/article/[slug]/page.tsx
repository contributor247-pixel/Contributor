import { notFound } from "next/navigation";
import { getArticleBySlug, getRecentArticles } from "@/lib/queries/articles";
import { getCommentsForArticle } from "@/lib/actions/comment";
import { auth } from "@/lib/auth";
import { getArticleAccessSource } from "@/lib/permissions";
import { logQualifyingRead } from "@/lib/revenue-split";
import { getActivePublicationSubscriptionName } from "@/lib/actions/subscription";
import { stripe } from "@/lib/stripe";
import { Avatar } from "@/components/shared/Avatar";
import { CategoryPill } from "@/components/shared/CategoryPill";
import { ArticleCard } from "@/components/shared/ArticleCard";
import { CommentSection } from "@/components/article/CommentSection";
import { ReportDialog } from "@/components/article/ReportDialog";
import { PaywallCard } from "@/components/article/PaywallCard";
import { timeAgo } from "@/lib/time-ago";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ session_id?: string }>;
}

// Optimistic unlock: right after a successful Stripe Checkout
// redirect, the webhook that writes the real `purchases` row may not
// have landed yet. Rather than make the buyer wait on that race, we
// verify the Checkout Session directly with Stripe (paid, matches
// this article/user) and treat that as sufficient access for this
// render — the webhook still reconciles the permanent purchases/
// ledger rows independently and is the source of truth for every
// later visit.
async function hasOptimisticAccess(sessionId: string | undefined, articleId: string, userId: string | undefined): Promise<boolean> {
  if (!sessionId || !userId) return false;
  try {
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    return (
      checkoutSession.payment_status === "paid" &&
      checkoutSession.metadata?.articleId === articleId &&
      checkoutSession.metadata?.userId === userId
    );
  } catch {
    return false;
  }
}

export default async function ArticlePage({ params, searchParams }: ArticlePageProps) {
  const { slug } = await params;
  const { session_id: sessionId } = await searchParams;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const session = await auth();

  const [comments, related, accessResult, optimisticAccess] = await Promise.all([
    getCommentsForArticle(article.id),
    getRecentArticles(4, article.id),
    getArticleAccessSource(session?.user?.id ?? null, article),
    hasOptimisticAccess(sessionId, article.id, session?.user?.id),
  ]);

  const hasAccess = accessResult.granted || optimisticAccess;

  // A qualifying read only needs logging for subscription-based access
  // (Platform or Publication) — purchases are already fully attributed
  // at purchase time, and free articles don't participate in the
  // pooled-revenue split at all. Fire-and-forget: a logging failure
  // must never break the page render for the reader.
  if (accessResult.granted && (accessResult.source === "platform_subscription" || accessResult.source === "publication_subscription")) {
    logQualifyingRead(session!.user.id, article.id, accessResult.billingPeriodStart).catch((err) => {
      console.error("Failed to log qualifying read:", err);
    });
  }
  const bodyHtml = (article.body as { html?: string } | null)?.html ?? "";
  const primaryAuthor = article.authors[0];
  const byline = article.authors.map((a) => a.name ?? "Unknown").join(" & ");
  const wordCount = bodyHtml.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  const readMinutes = Math.max(1, Math.round(wordCount / 200));

  const showPaywall = article.isPremium && !hasAccess;
  const activePublicationSubName = showPaywall && session?.user
    ? await getActivePublicationSubscriptionName(session.user.id)
    : null;

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-12 sm:px-6">
      <div className="lg:flex lg:items-start lg:gap-12">
        <article className="mx-auto max-w-3xl lg:mx-0 lg:max-w-[720px] lg:flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            <CategoryPill name={article.categoryName} slug={article.categorySlug} />
          </p>
          <h1 className="mt-3 font-serif text-3xl font-semibold leading-[1.15] text-text-heading sm:text-[2.75rem]">
            {article.title}
          </h1>
          <div className="mt-6 flex items-center gap-3 border-y border-border py-4">
            <Avatar name={primaryAuthor?.name ?? null} avatarUrl={primaryAuthor?.avatarUrl ?? null} size={44} />
            <div>
              <p className="text-sm font-semibold text-text-heading">{byline}</p>
              <p className="text-xs text-text-muted">
                {timeAgo(article.publishedAt)} · {readMinutes} min read
              </p>
            </div>
          </div>

          {article.coverImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- base64 cover
            <img
              src={article.coverImageUrl}
              alt={article.title}
              className="mt-8 aspect-[16/9] w-full rounded-[4px] object-cover"
            />
          )}

          {showPaywall ? (
            <div className="relative mt-8">
              <div className="relative max-h-[420px] overflow-hidden">
                <div
                  className="prose prose-neutral max-w-none whitespace-pre-wrap text-[1.0625rem] leading-[1.8] text-text-body"
                  dangerouslySetInnerHTML={{ __html: bodyHtml }}
                />
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-[200px] bg-gradient-to-t from-white to-transparent"
                  aria-hidden="true"
                />
              </div>
              <PaywallCard
                articleId={article.id}
                priceCents={article.priceCents ?? 0}
                publicationId={article.publicationId}
                publicationName={article.publicationName}
                activePublicationSubName={activePublicationSubName}
              />
            </div>
          ) : (
            <div
              className="prose prose-neutral mt-8 max-w-none whitespace-pre-wrap text-[1.0625rem] leading-[1.8] text-text-body"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
          )}

          <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
            <ReportDialog articleId={article.id} />
          </div>

          {/* Related Articles render as full cards below the reading column
              on mobile/tablet; at lg:+ they move into the sidebar instead
              (see aside below), so this block is lg:hidden to avoid showing
              the same content twice. */}
          {related.length > 0 && (
            <div className="mt-16 lg:hidden">
              <h2 className="mb-6 font-serif text-xl font-semibold text-text-heading">Related Articles</h2>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                {related.map((item) => (
                  <ArticleCard key={item.slug} article={item} showExcerpt={false} />
                ))}
              </div>
            </div>
          )}

          <div className="mt-16 border-t border-border pt-10">
            <CommentSection articleId={article.id} initialComments={comments} />
          </div>
        </article>

        {/* Desktop-only sidebar (author bio + a compact related-articles
            list), per docs/02_ThemeGuideline.md Section 7's article
            reading-view row: "Centered reading column ~720px + right
            sidebar (related/author bio)" at 1024px+. */}
        <aside className="hidden lg:sticky lg:top-24 lg:block lg:w-[320px] lg:shrink-0">
          <div className="rounded-[4px] border border-border p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted">Written by</p>
            <div className="mt-3 flex items-center gap-3">
              <Avatar name={primaryAuthor?.name ?? null} avatarUrl={primaryAuthor?.avatarUrl ?? null} size={40} />
              <div>
                <p className="text-sm font-semibold text-text-heading">{byline}</p>
                <p className="text-xs text-text-muted">Contributor</p>
              </div>
            </div>
          </div>

          {related.length > 0 && (
            <div className="mt-6 rounded-[4px] border border-border p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-text-muted">
                Related Articles
              </p>
              <ul className="flex flex-col gap-4">
                {related.map((item) => (
                  <li key={item.slug}>
                    <a href={`/article/${item.slug}`} className="group block">
                      <p className="font-serif text-sm font-semibold leading-snug text-text-heading transition-colors group-hover:text-primary">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs text-text-muted">
                        {item.category.name} · {timeAgo(item.publishedAt)}
                      </p>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
