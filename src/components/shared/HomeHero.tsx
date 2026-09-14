import Link from "next/link";
import type { ArticleCardData } from "@/components/shared/ArticleCard";
import { HeroParallaxImage } from "@/components/shared/HeroParallaxImage";
import { timeAgo } from "@/lib/time-ago";

interface HomeHeroProps {
  featured: ArticleCardData;
  rail: ArticleCardData[];
}

export function HomeHero({ featured, rail }: HomeHeroProps) {
  return (
    <section data-dark-surface className="relative bg-ink text-white">
      <Link
        href={`/article/${featured.slug}`}
        className="group relative block h-[68vh] min-h-[440px] w-full overflow-hidden sm:h-[74vh] sm:min-h-[560px] lg:h-[82vh] lg:max-h-[780px]"
      >
        {featured.coverImageUrl && (
          <HeroParallaxImage src={featured.coverImageUrl} alt={featured.title} />
        )}
        {/* Layered art-direction, not a single flat fade: a warm
            duotone wash keyed to the oxblood accent so the photo reads
            as edited/curated rather than a raw stock crop, a directional
            vignette that pulls focus toward the lower-left copy block
            (per docs/02_ThemeGuideline.md's "confident editorial
            magazine" mood — pure bottom-fade alone read flat/generic),
            and a top scrim so the sticky navbar stays legible over any
            photo. All three are decorative gradients, aria-hidden. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(200deg,rgba(139,30,63,0.22)_0%,transparent_45%)] mix-blend-hard-light"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_18%_100%,rgba(20,20,26,0.94)_0%,rgba(20,20,26,0.55)_38%,transparent_72%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/70 to-transparent"
        />

        <div className="absolute inset-0 mx-auto flex max-w-[1320px] flex-col justify-end px-4 pb-10 sm:px-6 sm:pb-14 lg:px-8 lg:pb-20">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-subtle">
              <span className="h-px w-6 bg-primary-subtle/70" aria-hidden="true" />
              {timeAgo(featured.publishedAt)} &middot; {featured.category.name}
            </p>
            <h1 className="mt-4 text-balance font-serif text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              {featured.title}
            </h1>
            <p className="mt-5 hidden max-w-xl text-base leading-relaxed text-white/75 sm:block">
              {featured.excerpt}
            </p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white transition-transform duration-200 group-hover:translate-x-1">
              Read the story
              <span aria-hidden="true">&rarr;</span>
            </span>
          </div>
        </div>
      </Link>

      {rail.length > 0 && (
        // Column count matches the real item count (capped at the
        // original 2/4 split) instead of always reserving 4 columns —
        // with fewer than 4 rail items, a fixed 4-col grid left dead,
        // empty dark space where the missing items would have sat.
        <div
          className={`mx-auto grid max-w-[1320px] gap-px border-t border-white/10 bg-white/10 ${
            rail.length === 1
              ? "grid-cols-1"
              : rail.length === 2
                ? "grid-cols-2"
                : rail.length === 3
                  ? "grid-cols-2 sm:grid-cols-3"
                  : "grid-cols-2 sm:grid-cols-4"
          }`}
        >
          {rail.map((item) => (
            <Link
              key={item.slug}
              href={`/article/${item.slug}`}
              className="group flex items-center gap-3 bg-ink p-4 transition-colors hover:bg-white/[0.06] sm:p-5"
            >
              <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[4px] bg-white/10 sm:h-16 sm:w-16">
                {item.coverImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- base64 cover
                  <img
                    src={item.coverImageUrl}
                    alt=""
                    aria-hidden="true"
                    className="h-full w-full object-cover transition-transform duration-[220ms] ease-out group-hover:scale-[1.05]"
                  />
                )}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-white/45">
                  <span>{timeAgo(item.publishedAt)}</span>
                  <span aria-hidden="true">&middot;</span>
                  <span>{item.category.name}</span>
                </div>
                <h4 className="mt-1 line-clamp-2 font-serif text-sm font-semibold leading-snug text-white/90 group-hover:text-primary-subtle sm:text-base">
                  {item.title}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
