"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Clock, ArrowUpRight, Sparkles, BookOpen } from "lucide-react";
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
  publishedAt: Date | string | null;
  category: { name: string; slug: string };
  author: { name: string | null; avatarUrl: string | null };
}

interface ArticleCardProps {
  article: ArticleCardData;
  showExcerpt?: boolean;
  titleAs?: "h2" | "h3";
}

function estimateReadTime(text: string | null | undefined): string {
  if (!text) return "4 min read";
  const words = text.trim().split(/\s+/).length;
  const mins = Math.max(2, Math.round(words / 35));
  return `${mins} min read`;
}

export function ArticleCard({ article, showExcerpt = true, titleAs = "h3" }: ArticleCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const TitleTag = titleAs;
  const readTime = estimateReadTime(article.excerpt ?? article.title);

  return (
    <motion.article
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-surface p-4 transition-all duration-300 hover:border-primary/40 hover:shadow-[0_14px_34px_-10px_rgba(139,30,63,0.14)] sm:p-5"
      whileHover={
        prefersReducedMotion
          ? undefined
          : { y: -4 }
      }
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Cover Image Frame — aria-hidden because the title Link a few
          lines below already provides a full, real link to this exact
          article. Without this, a screen reader user gets two
          consecutive links to the same destination: one from this
          image wrapper (previously announcing the full title again
          via alt=article.title, now would announce nothing useful
          with alt=""), and the real one from the title text. Hiding
          this redundant link entirely (rather than just emptying the
          image's alt) avoids trading an announce-twice problem for an
          unlabeled-link problem — the image stays visually identical,
          just removed from the accessibility tree as a link/image
          pair, per WCAG's guidance for this exact "image link
          immediately followed by a text link to the same place"
          pattern. */}
      <Link
        href={`/article/${article.slug}`}
        prefetch={false}
        aria-hidden="true"
        tabIndex={-1}
        className="relative block aspect-[16/10] overflow-hidden rounded-xl border border-border/60 bg-bg-muted"
      >
        {article.isPremium ? (
          <PremiumBadge />
        ) : (
          /* Distinctive Open Dispatch Tag for Standard (Free) Articles */
          <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-ink/75 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-sm backdrop-blur-md">
            <BookOpen className="h-3 w-3 text-supportive-subtle" aria-hidden="true" />
            <span>Dispatch</span>
          </span>
        )}

        {article.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- covers are stored as base64 data URLs
          <img
            src={article.coverImageUrl}
            // Empty alt, not article.title — this image is wrapped in
            // a Link to the same article whose visible title text
            // appears again a few lines below in its own Link. A
            // non-empty alt here made a screen reader announce the
            // full title twice in a row for what's functionally one
            // destination (confirmed via axe-core's image-redundant-alt
            // rule). The cover image is decorative in this context;
            // the text link already carries the accessible name.
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-bg-muted to-border/40 text-xs font-serif italic text-text-muted">
            <BookOpen className="h-5 w-5 text-primary/40" />
            <span>{article.category.name}</span>
          </div>
        )}

        {/* Ambient duotone shadow on image */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/15"
        />

        {/* Read time pill floating bottom right */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-full border border-white/15 bg-ink/80 px-2.5 py-0.5 text-[10px] font-medium text-white shadow-xs backdrop-blur-md">
          <Clock className="h-2.5 w-2.5 text-supportive" aria-hidden="true" />
          <span>{readTime}</span>
        </div>
      </Link>

      {/* Card Content */}
      <div className="mt-4 flex flex-1 flex-col">
        {/* Byline / Timestamp Header */}
        <div className="flex items-center justify-between text-[11px] text-text-muted">
          <span className="flex items-center gap-1 font-medium text-text-muted">
            <span>{timeAgo(article.publishedAt)}</span>
            <span aria-hidden="true">&bull;</span>
            <CategoryPill name={article.category.name} slug={article.category.slug} />
          </span>

          <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
            {article.isPremium ? "Subscriber" : "Free Edition"}
          </span>
        </div>

        {/* Headline */}
        <Link href={`/article/${article.slug}`} prefetch={false} className="mt-2.5 block">
          <TitleTag className="font-serif text-lg font-semibold leading-[1.3] text-text-heading transition-colors duration-200 group-hover:text-primary sm:text-xl">
            {article.title}
          </TitleTag>
        </Link>

        {/* Excerpt */}
        {showExcerpt && article.excerpt && (
          <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-text-muted">
            {article.excerpt}
          </p>
        )}

        {/* Footer Bar: Author & Read Action */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/70">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="relative shrink-0">
              <Avatar name={article.author.name} avatarUrl={article.author.avatarUrl} size={26} />
            </div>
            <div className="truncate">
              <span className="block truncate text-xs font-semibold text-text-heading group-hover:text-primary transition-colors">
                {article.author.name ?? "Independent Author"}
              </span>
            </div>
          </div>

          <Link
            href={`/article/${article.slug}`}
            prefetch={false}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/80 bg-bg-muted px-3.5 py-1 text-xs font-semibold text-text-heading transition-all duration-200 group-hover:border-primary group-hover:bg-primary group-hover:text-white group-hover:shadow-xs"
            aria-label={`Read story: ${article.title}`}
          >
            <span>Read</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}


