import Link from "next/link";
import { Clock, Sparkles, BookOpen, ShieldCheck, Zap, Award } from "lucide-react";
import type { ArticleCardData } from "@/components/shared/ArticleCard";
import { HeroParallaxImage } from "@/components/shared/HeroParallaxImage";
import { Avatar } from "@/components/shared/Avatar";
import { timeAgo } from "@/lib/time-ago";

interface HomeHeroProps {
  featured: ArticleCardData;
  rail: ArticleCardData[];
}

function estimateReadTime(text: string | null | undefined): string {
  if (!text) return "4 min read";
  const words = text.trim().split(/\s+/).length;
  const mins = Math.max(3, Math.round(words / 40));
  return `${mins} min read`;
}

export function HomeHero({ featured, rail }: HomeHeroProps) {
  const readTime = estimateReadTime(featured.excerpt ?? featured.title);

  return (
    <section data-dark-surface className="relative bg-ink text-white">
      <Link
        href={`/article/${featured.slug}`}
        className="group relative block h-[72vh] min-h-[480px] w-full overflow-hidden sm:h-[78vh] sm:min-h-[580px] lg:h-[84vh] lg:max-h-[820px]"
      >
        {featured.coverImageUrl && (
          <HeroParallaxImage src={featured.coverImageUrl} alt={featured.title} />
        )}

        {/* Ambient layered editorial vignettes & oxblood/gold duotone wash */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(100%_80%_at_15%_100%,rgba(20,20,26,0.96)_0%,rgba(20,20,26,0.68)_45%,transparent_75%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(210deg,rgba(139,30,63,0.3)_0%,transparent_50%)] mix-blend-screen"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_50%_at_90%_20%,rgba(217,119,6,0.12),transparent_70%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/80 via-ink/40 to-transparent"
        />

        {/* Hero Content Container */}
        <div className="absolute inset-0 mx-auto flex max-w-[1320px] flex-col justify-end px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8 lg:pb-22">
          <div className="max-w-3xl">
            {/* Editorial Eyebrow with Pulsing Pill */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-supportive/50 bg-supportive/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-supportive-subtle backdrop-blur-xs">
                <span className="animate-pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-supportive shadow-[0_0_6px_var(--color-supportive)]" />
                Curated Lead Story
              </span>

              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-medium tracking-wide text-white/90 backdrop-blur-xs">
                {featured.category.name}
              </span>

              <span className="flex items-center gap-1 text-xs text-white/60">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {readTime} &bull; {timeAgo(featured.publishedAt)}
              </span>
            </div>

            {/* Headline */}
            <h1 className="mt-4 text-balance font-serif text-3xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              {featured.title}
            </h1>

            {/* Excerpt */}
            {featured.excerpt && (
              <p className="mt-4 hidden max-w-2xl text-base leading-relaxed text-white/80 sm:block sm:text-lg">
                {featured.excerpt}
              </p>
            )}

            {/* Author Byline & CTA */}
            <div className="mt-6 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2.5">
                <Avatar
                  name={featured.author.name}
                  avatarUrl={featured.author.avatarUrl}
                  size={32}
                />
                <span className="text-sm font-medium text-white/90">
                  By {featured.author.name ?? "Editorial Staff"}
                </span>
              </div>

              <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 group-hover:border-white group-hover:bg-white group-hover:text-ink group-hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                <span>Read the full dispatch</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">&rarr;</span>
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Magazine Rail Strip */}
      {rail.length > 0 && (
        <div className="border-t border-white/10 bg-ink-soft/90 backdrop-blur-sm">
          <div
            className={`mx-auto grid max-w-[1320px] divide-y divide-white/10 sm:divide-y-0 sm:divide-x sm:divide-white/10 ${
              rail.length === 1
                ? "grid-cols-1"
                : rail.length === 2
                  ? "grid-cols-1 sm:grid-cols-2"
                  : rail.length === 3
                    ? "grid-cols-1 sm:grid-cols-3"
                    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            }`}
          >
            {rail.map((item, idx) => (
              <Link
                key={item.slug}
                href={`/article/${item.slug}`}
                className="group relative flex items-center gap-3.5 p-4 transition-all duration-200 hover:bg-white/[0.06] sm:p-5"
              >
                {/* Number Badge — purely a decorative watermark (the
                    heading text right below already conveys the real
                    content, and DOM order already conveys the
                    sequence). aria-hidden removes it from the
                    accessibility tree for screen readers, but WCAG
                    1.4.3 contrast still applies to anything visibly
                    rendered regardless of aria-hidden — axe-core
                    correctly flags it either way. white/20 measured
                    1.9:1 against the ink background; bumped to
                    white/50 (~5.1:1) to clear the 4.5:1 normal-text
                    threshold while staying visibly subtler than the
                    hover state. */}
                <span
                  aria-hidden="true"
                  className="absolute right-3 top-3 font-serif text-xs font-semibold text-white/50 group-hover:text-supportive-subtle/40"
                >
                  0{idx + 1}
                </span>

                <span className="relative h-15 w-15 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:h-16 sm:w-16">
                  {item.coverImageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element -- base64 cover
                    <img
                      src={item.coverImageUrl}
                      alt=""
                      aria-hidden="true"
                      className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-108"
                    />
                  )}
                </span>
                <div className="min-w-0 flex-1 pr-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-supportive-subtle">
                    <span>{item.category.name}</span>
                    <span className="text-white/30" aria-hidden="true">&bull;</span>
                    <span className="text-white/50">{timeAgo(item.publishedAt)}</span>
                  </div>
                  {/* h2, not h3/h4 — this rail has no wrapping section
                      heading of its own (unlike every other article
                      grid on the page, which sits under a
                      SectionContainer's h2), so its titles are the
                      first heading level directly under the hero's h1
                      in document order. h3 still skipped a level here:
                      Lighthouse's heading-order audit confirmed no h2
                      exists anywhere before these titles in the DOM. */}
                  <h2 className="mt-1 line-clamp-2 font-serif text-sm font-semibold leading-snug text-white/90 transition-colors group-hover:text-white">
                    {item.title}
                  </h2>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Editorial Platform Trust Strip */}
      <div className="border-b border-t border-white/[0.08] bg-ink text-white/70">
        <div className="mx-auto grid max-w-[1320px] grid-cols-2 gap-4 px-4 py-4 sm:px-6 md:grid-cols-4 lg:px-8">
          <div className="flex items-center gap-2.5">
            <BookOpen className="h-4 w-4 text-supportive shrink-0" aria-hidden="true" />
            <span className="text-xs font-medium text-white/80">Deep Longform &amp; Curated Stories</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Zap className="h-4 w-4 text-primary-subtle shrink-0" aria-hidden="true" />
            <span className="text-xs font-medium text-white/80">Direct Writer Monetization</span>
          </div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-4 w-4 text-success shrink-0" aria-hidden="true" />
            <span className="text-xs font-medium text-white/80">100% Ad-Free Reading Experience</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Award className="h-4 w-4 text-supportive shrink-0" aria-hidden="true" />
            <span className="text-xs font-medium text-white/80">Peer-Reviewed Quality Standards</span>
          </div>
        </div>
      </div>
    </section>
  );
}

