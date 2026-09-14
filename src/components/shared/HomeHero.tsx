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
    <section data-dark-surface className="bg-ink text-white">
      <Link href={`/article/${featured.slug}`} className="relative block h-[520px] w-full overflow-hidden">
        {featured.coverImageUrl && (
          <HeroParallaxImage src={featured.coverImageUrl} alt={featured.title} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <div className="absolute bottom-0 left-0 max-w-2xl p-6 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {timeAgo(featured.publishedAt)} · {featured.category.name}
          </p>
          <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight sm:text-5xl">
            {featured.title}
          </h1>
          <p className="mt-3 hidden max-w-xl text-white/80 sm:block">{featured.excerpt}</p>
        </div>
      </Link>
      {rail.length > 0 && (
        // Column count matches the real item count (capped at the
        // original 2/4 split) instead of always reserving 4 columns —
        // with fewer than 4 rail items (e.g. early on, before enough
        // articles exist), a fixed 4-col grid left dead, empty dark
        // space where the missing items would have sat.
        <div
          className={`mx-auto grid max-w-[1320px] gap-px bg-white/10 ${
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
              className="group bg-ink p-4 transition-colors hover:bg-white/5"
            >
              <p className="text-xs text-white/50">{timeAgo(item.publishedAt)}</p>
              <h4 className="mt-1 line-clamp-2 text-sm font-medium text-white/90 group-hover:text-primary">
                {item.title}
              </h4>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
