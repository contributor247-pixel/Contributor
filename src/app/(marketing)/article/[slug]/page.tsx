import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Clock, Sparkles, BookOpen, ShieldCheck, PenSquare, ArrowUpRight, Share2, Compass } from "lucide-react";
import { getArticleBySlug, getRecentArticles } from "@/lib/queries/articles";
import { buildMetadata } from "@/lib/seo";
import { getCommentsForArticle } from "@/lib/actions/comment";
import { auth } from "@/lib/auth";
import { getArticleAccessSource } from "@/lib/permissions";
import { logQualifyingRead } from "@/lib/revenue-split";
import { getActivePublicationSubscriptionName, hasActivePlatformSubscription } from "@/lib/actions/subscription";
import { stripe } from "@/lib/stripe";
import { Avatar } from "@/components/shared/Avatar";
import { CategoryPill } from "@/components/shared/CategoryPill";
import { ArticleCard } from "@/components/shared/ArticleCard";
import { CommentSection } from "@/components/article/CommentSection";
import { ReportDialog } from "@/components/article/ReportDialog";
import { PaywallCard } from "@/components/article/PaywallCard";
import { ArticleShareBar } from "@/components/article/ArticleShareBar";
import { ReadingProgressBar } from "@/components/article/ReadingProgressBar";
import { PremiumBadge } from "@/components/shared/PremiumBadge";
import { timeAgo } from "@/lib/time-ago";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ session_id?: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return buildMetadata({ title: "Article", description: "", path: `/article/${slug}`, noIndex: true });

  const description = article.excerpt ?? `Read "${article.title}" on Contributor.`;
  return buildMetadata({
    title: article.title,
    description,
    path: `/article/${article.slug}`,
  });
}

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

  if (accessResult.granted && (accessResult.source === "platform_subscription" || accessResult.source === "publication_subscription")) {
    logQualifyingRead(session!.user.id, article.id, accessResult.billingPeriodStart).catch((err) => {
      console.error("Failed to log qualifying read:", err);
    });
  }

  const bodyHtml = (article.body as { html?: string } | null)?.html ?? "";
  const primaryAuthor = article.authors[0];
  const byline = article.authors.map((a) => a.name ?? "Independent Author").join(" & ");
  const wordCount = bodyHtml.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  const readMinutes = Math.max(2, Math.round(wordCount / 200));

  const showPaywall = article.isPremium && !hasAccess;
  const [activePublicationSubName, hasPlatformSub] = showPaywall && session?.user
    ? await Promise.all([
        getActivePublicationSubscriptionName(session.user.id),
        hasActivePlatformSubscription(session.user.id),
      ])
    : [null, false];

  return (
    <div className="relative min-h-screen bg-bg">
      {/* Floating Reading Progress Indicator */}
      <ReadingProgressBar />

      {/* Main Reading Container */}
      <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Top Breadcrumb & Navigation Row */}
        <div className="mb-6 flex items-center justify-between border-b border-border/70 pb-4 text-xs text-text-muted">
          <Link
            href="/content"
            className="group inline-flex items-center gap-1.5 font-medium text-text-muted transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Back to All Dispatches</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href={`/content/${article.categorySlug}`}
              className="rounded-full border border-border/80 bg-surface px-3 py-1 font-medium text-text-body transition-colors hover:border-primary hover:text-primary"
            >
              {article.categoryName}
            </Link>
            {article.isPremium && (
              // text-supportive (#d97706) only reaches ~3.2:1 against
              // this badge's pale bg-supportive/15 tint — fails WCAG AA
              // 4.5:1 for text. text-[#a15804] is a darkened shade of
              // the same hue, chosen to clear 4.5:1 against this
              // specific light background without touching the shared
              // --color-supportive token (which is correctly at
              // 5.76:1+ everywhere it's used on dark surfaces).
              <span className="inline-flex items-center gap-1 rounded-full border border-supportive/50 bg-supportive/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#a15804]">
                <Sparkles className="h-3 w-3 text-supportive" />
                <span>Premium</span>
              </span>
            )}
          </div>
        </div>

        {/* 2-Column Responsive Layout: Centered Reading Stream (720px) + Sticky Sidebar (340px) */}
        <div className="lg:flex lg:items-start lg:gap-12 xl:gap-16">
          {/* Main Article Column */}
          <article className="mx-auto max-w-3xl lg:mx-0 lg:max-w-[740px] lg:flex-1">
            {/* Category / Publication Attribution */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold uppercase tracking-[0.18em] text-primary">
                {article.categoryName}
              </span>
              {article.publicationName && (
                <>
                  <span className="text-text-muted" aria-hidden="true">&bull;</span>
                  <span className="text-text-muted">
                    Published in <strong>{article.publicationName}</strong>
                  </span>
                </>
              )}
            </div>

            {/* Main Headline */}
            <h1 className="mt-3 font-serif text-3xl font-semibold leading-[1.12] tracking-tight text-text-heading sm:text-4xl lg:text-5xl">
              {article.title}
            </h1>

            {/* Excerpt / Lead */}
            {article.excerpt && (
              <p className="mt-4 font-serif text-lg leading-relaxed text-text-muted italic sm:text-xl">
                {article.excerpt}
              </p>
            )}

            {/* Author Byline & Social Share Row */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-border/80 py-4">
              <div className="flex items-center gap-3">
                <Avatar
                  name={primaryAuthor?.name ?? null}
                  avatarUrl={primaryAuthor?.avatarUrl ?? null}
                  size={46}
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-text-heading">{byline}</p>
                    <span className="rounded-full bg-primary/10 px-1.5 py-0.2 text-[10px] font-semibold text-primary">
                      Verified
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <span>{timeAgo(article.publishedAt)}</span>
                    <span aria-hidden="true">&bull;</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-supportive" />
                      {readMinutes} min read
                    </span>
                  </div>
                </div>
              </div>

              {/* Share & Bookmark Actions */}
              <ArticleShareBar title={article.title} />
            </div>

            {/* Cover Image */}
            {article.coverImageUrl && (
              <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border/80 shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element -- base64 cover */}
                <img
                  src={article.coverImageUrl}
                  alt={article.title}
                  className="h-full w-full object-cover"
                />
                {article.isPremium && <PremiumBadge />}
              </div>
            )}

            {/* Body Content / Paywall Stream */}
            {showPaywall ? (
              <div className="relative mt-8">
                <div className="relative max-h-[440px] overflow-hidden">
                  <div
                    className="prose prose-neutral max-w-none font-serif text-[1.0625rem] leading-[1.85] text-text-body"
                    dangerouslySetInnerHTML={{ __html: bodyHtml }}
                  />
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-[220px] bg-gradient-to-t from-bg via-bg/85 to-transparent"
                    aria-hidden="true"
                  />
                </div>
                <PaywallCard
                  articleId={article.id}
                  priceCents={article.priceCents ?? 0}
                  publicationId={article.publicationId}
                  publicationName={article.publicationName}
                  activePublicationSubName={activePublicationSubName}
                  hasActivePlatformSub={hasPlatformSub}
                />
              </div>
            ) : (
              <div
                className="prose prose-neutral mt-8 max-w-none font-serif text-[1.0625rem] leading-[1.85] text-text-body [&>p]:mt-5 [&>h2]:mt-10 [&>h2]:font-serif [&>h2]:text-2xl [&>h3]:mt-8 [&>blockquote]:border-l-primary [&>blockquote]:italic [&>blockquote]:text-text-heading"
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            )}

            {/* Editorial Footer Meta Bar */}
            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border/80 pt-6">
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">Topic:</span>
                <CategoryPill name={article.categoryName} slug={article.categorySlug} />
              </div>
              <ReportDialog articleId={article.id} />
            </div>

            {/* Mobile / Tablet Related Articles */}
            {related.length > 0 && (
              <div className="mt-16 lg:hidden">
                <div className="mb-6 flex items-center justify-between border-b border-border/70 pb-3">
                  <h2 className="font-serif text-xl font-semibold text-text-heading">
                    Related Curations
                  </h2>
                  <Link href="/content" className="text-xs font-semibold text-primary">
                    View all &rarr;
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {related.map((item) => (
                    <ArticleCard key={item.slug} article={item} showExcerpt={false} />
                  ))}
                </div>
              </div>
            )}

            {/* Comments & Community Dialogue Section */}
            <div className="mt-16 border-t border-border/80 pt-10">
              <CommentSection articleId={article.id} initialComments={comments} />
            </div>
          </article>

          {/* Desktop Sticky Sidebar */}
          <aside className="hidden lg:sticky lg:top-28 lg:block lg:w-[340px] lg:shrink-0 space-y-6">
            {/* Card 1: Author Spotlight Showcase */}
            <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                Author Spotlight
              </p>
              <div className="mt-4 flex items-center gap-3">
                <Avatar
                  name={primaryAuthor?.name ?? null}
                  avatarUrl={primaryAuthor?.avatarUrl ?? null}
                  size={48}
                />
                <div>
                  <p className="text-sm font-semibold text-text-heading">{byline}</p>
                  <p className="text-xs text-text-muted">Independent Creator</p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-text-muted">
                Writes longform investigative journalism and critical essays published on Contributor.
              </p>
              <div className="mt-5 border-t border-border/60 pt-4">
                <Link
                  href="/dashboard/author/articles/new"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-primary/40 bg-primary/10 py-2.5 text-xs font-semibold text-primary transition-all hover:bg-primary hover:text-white shadow-xs"
                >
                  <PenSquare className="h-3.5 w-3.5" />
                  <span>Publish on Contributor</span>
                </Link>
              </div>
            </div>

            {/* Card 2: Related Curated Dispatches ("Next in Stream") */}
            {related.length > 0 && (
              <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs">
                <div className="mb-4 flex items-center justify-between border-b border-border/70 pb-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-heading">
                    Next in Stream
                  </p>
                  <span className="text-[10px] font-mono text-text-muted">Curated</span>
                </div>
                <ul className="flex flex-col divide-y divide-border/60">
                  {related.map((item, i) => (
                    <li key={item.slug} className="group py-3.5 first:pt-1 last:pb-1">
                      <Link href={`/article/${item.slug}`} prefetch={false} className="block">
                        <div className="flex items-center gap-2 text-[10px] font-medium text-text-muted">
                          <span className="font-serif font-bold text-supportive">
                            0{i + 1}
                          </span>
                          <span>&bull;</span>
                          <span className="text-text-body font-semibold">{item.category.name}</span>
                          <span>&bull;</span>
                          <span>{timeAgo(item.publishedAt)}</span>
                        </div>
                        <h4 className="mt-1 font-serif text-sm font-semibold leading-snug text-text-heading transition-colors group-hover:text-primary">
                          {item.title}
                        </h4>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

