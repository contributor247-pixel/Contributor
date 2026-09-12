"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Avatar } from "@/components/shared/Avatar";
import { CategoryPill } from "@/components/shared/CategoryPill";
import { PremiumBadge } from "@/components/shared/PremiumBadge";
import { timeAgo } from "@/lib/time-ago";

export interface ArticleCardData {
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  isPremium: boolean;
  // string when this data has round-tripped through a JSON API
  // response (e.g. the search overlay's fetch), Date when it comes
  // straight from a Server Component's DB query.
  publishedAt: Date | string | null;
  category: { name: string; slug: string };
  author: { name: string | null; avatarUrl: string | null };
}

interface ArticleCardProps {
  article: ArticleCardData;
  showExcerpt?: boolean;
  // Defaults to h3, correct when the grid sits under a page's own
  // <h2> section heading (SectionContainer's "More Stories"/"Latest"
  // on the homepage). Pages whose grid sits directly under the page's
  // <h1> with no intervening <h2> (Content Listing, category pages,
  // search, publication page) pass "h2" instead, so the heading
  // hierarchy never skips a level — caught by a Lighthouse
  // heading-order audit failure during Step 16.
  titleAs?: "h2" | "h3";
}

// Card hover: lift -4px + shadow grow + image scale(1.03), 220ms
// ease-out, per docs/02_ThemeGuideline.md Section 6 — Framer Motion
// owns card-level hover per that section's library-ownership rule
// (not a plain CSS transition). whileHover on the wrapping
// motion.article drives the lift/shadow; the image's own scale
// still rides on the existing group-hover CSS class since it's a
// nested element Framer Motion's single whileHover variant can't
// reach without a second motion component — group-hover keeps that
// in sync with the same hover state for free.
export function ArticleCard({ article, showExcerpt = true, titleAs = "h3" }: ArticleCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const TitleTag = titleAs;

  return (
    <motion.article
      className="group flex flex-col rounded-[4px]"
      whileHover={prefersReducedMotion ? undefined : { y: -4, boxShadow: "0 12px 24px -8px rgba(20, 20, 26, 0.18)" }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/article/${article.slug}`} className="relative block aspect-[16/10] overflow-hidden rounded-[4px] bg-bg-muted">
        {article.isPremium && <PremiumBadge />}
        {article.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- covers are stored as base64 data URLs
          <img
            src={article.coverImageUrl}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-[220ms] ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-muted">No image</div>
        )}
      </Link>
      <div className="mt-3 flex flex-1 flex-col">
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <span>{timeAgo(article.publishedAt)}</span>
          <span>for</span>
          <CategoryPill name={article.category.name} slug={article.category.slug} />
        </div>
        <Link href={`/article/${article.slug}`}>
          <TitleTag className="mt-1.5 line-clamp-2 font-serif text-lg font-semibold leading-snug text-text-heading transition-colors group-hover:text-primary">
            {article.title}
          </TitleTag>
        </Link>
        {showExcerpt && article.excerpt && (
          <p className="mt-1.5 line-clamp-2 text-sm text-text-muted">{article.excerpt}</p>
        )}
        <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
          <Avatar name={article.author.name} avatarUrl={article.author.avatarUrl} size={24} />
          <span>
            Created by <span className="text-text-body">{article.author.name ?? "Unknown"}</span>
          </span>
        </div>
      </div>
    </motion.article>
  );
}
