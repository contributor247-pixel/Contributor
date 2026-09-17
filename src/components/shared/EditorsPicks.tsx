import Link from "next/link";
import { Clock, Star, TrendingUp } from "lucide-react";
import type { ArticleCardData } from "@/components/shared/ArticleCard";
import { CategoryPill } from "@/components/shared/CategoryPill";
import { ScrollRevealGrid } from "@/components/shared/ScrollRevealGrid";
import { Avatar } from "@/components/shared/Avatar";
import { PremiumBadge } from "@/components/shared/PremiumBadge";
import { timeAgo } from "@/lib/time-ago";

interface EditorsPicksProps {
  featured: ArticleCardData;
  picks: ArticleCardData[];
}

function estimateReadTime(text: string | null | undefined): string {
  if (!text) return "4 min read";
  const words = text.trim().split(/\s+/).length;
  const mins = Math.max(2, Math.round(words / 35));
  return `${mins} min read`;
}

export function EditorsPicks({ featured, picks }: EditorsPicksProps) {
  const featuredReadTime = estimateReadTime(featured.excerpt ?? featured.title);

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {/* Spotlight Feature Column (Left) */}
      <div className="lg:col-span-7">
        <div className="group relative flex h-full flex-col rounded-2xl border border-border/80 bg-surface p-4 sm:p-6 shadow-sm transition-all duration-200 hover:border-primary/40 hover:shadow-md">
          {/* aria-hidden + tabIndex={-1}: this image Link duplicates the
              title Link a few lines below (same href, same accessible
              destination) — same redundant-link pattern as ArticleCard's
              cover image. Empty alt on the image, hidden wrapping Link,
              real title Link carries the accessible name. */}
          <Link
            href={`/article/${featured.slug}`}
            className="block"
            aria-hidden="true"
            tabIndex={-1}
          >
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-bg-muted">
              {featured.isPremium && <PremiumBadge />}
              {featured.coverImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- base64 cover
                <img
                  src={featured.coverImageUrl}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                />
              )}
              {/* Overlay pill */}
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-ink/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-supportive-subtle backdrop-blur-md shadow-xs">
                <Star className="h-3 w-3 text-supportive" aria-hidden="true" />
                Featured Selection
              </div>
            </div>
          </Link>

          <div className="mt-5 flex flex-1 flex-col">
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <span>{timeAgo(featured.publishedAt)}</span>
              <span aria-hidden="true">&bull;</span>
              <CategoryPill name={featured.category.name} slug={featured.category.slug} />
              <span aria-hidden="true">&bull;</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-supportive" aria-hidden="true" />
                {featuredReadTime}
              </span>
            </div>

            <Link href={`/article/${featured.slug}`}>
              <h3 className="mt-2.5 font-serif text-2xl font-semibold leading-snug text-text-heading transition-colors group-hover:text-primary sm:text-3xl">
                {featured.title}
              </h3>
            </Link>

            {featured.excerpt && (
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-text-muted sm:text-base">
                {featured.excerpt}
              </p>
            )}

            <div className="mt-auto pt-6 flex items-center justify-between border-t border-border/60">
              <div className="flex items-center gap-2.5 text-xs text-text-muted">
                <Avatar name={featured.author.name} avatarUrl={featured.author.avatarUrl} size={28} />
                <span className="font-medium text-text-body">{featured.author.name ?? "Independent Author"}</span>
              </div>
              <Link
                href={`/article/${featured.slug}`}
                className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-bg-muted px-3 py-1 text-xs font-semibold text-text-heading transition-colors hover:border-primary hover:bg-primary hover:text-white"
              >
                <span>Read story</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Ranked Leaderboard Column (Right) */}
      <div className="flex flex-col rounded-2xl border border-border/80 bg-surface p-5 sm:p-6 shadow-sm lg:col-span-5">
        <div className="mb-4 flex items-center justify-between border-b border-border/70 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" aria-hidden="true" />
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-text-heading">
              Editor Curations
            </h4>
          </div>
          <span className="text-[11px] font-medium text-text-muted">Top 4</span>
        </div>

        <ScrollRevealGrid as="ol" className="flex flex-1 flex-col divide-y divide-border/70">
          {picks.map((pick, i) => {
            const pickReadTime = estimateReadTime(pick.excerpt ?? pick.title);
            return (
              <li
                key={pick.slug}
                className="group flex gap-4 py-4 first:pt-2 last:pb-0 transition-colors hover:bg-bg-muted/50 rounded-xl px-2.5 -mx-2.5"
              >
                <span className="font-serif text-2xl font-bold text-supportive/70 transition-colors group-hover:text-supportive sm:text-3xl shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                    <span className="font-medium text-text-body">{pick.category.name}</span>
                    <span aria-hidden="true">&bull;</span>
                    <span>{pickReadTime}</span>
                  </div>
                  <Link href={`/article/${pick.slug}`}>
                    <h5 className="mt-1 line-clamp-2 font-serif text-sm font-semibold leading-snug text-text-heading transition-colors group-hover:text-primary sm:text-base">
                      {pick.title}
                    </h5>
                  </Link>
                  <p className="mt-1 text-[11px] text-text-muted truncate">
                    By {pick.author.name ?? "Independent Author"}
                  </p>
                </div>
              </li>
            );
          })}
        </ScrollRevealGrid>
      </div>
    </div>
  );
}

