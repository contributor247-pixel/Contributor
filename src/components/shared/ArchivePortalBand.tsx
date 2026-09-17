import Link from "next/link";
import { ArrowRight, BookOpen, Compass, Search, Sparkles } from "lucide-react";

interface ArchivePortalBandProps {
  totalCount: number;
  categories: { name: string; slug: string; articleCount?: number }[];
}

export function ArchivePortalBand({ totalCount, categories }: ArchivePortalBandProps) {
  return (
    <div
      data-dark-surface
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-ink via-ink to-ink-soft p-6 shadow-2xl sm:p-10 lg:p-12"
    >
      {/* Radiant ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(100%_100%_at_50%_0%,rgba(139,30,63,0.35),transparent_70%),radial-gradient(60%_60%_at_90%_90%,rgba(217,119,6,0.12),transparent_70%)]"
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
        {/* Live Catalog Badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-supportive/50 bg-supportive/20 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-supportive-subtle backdrop-blur-xs">
            <Sparkles className="h-3 w-3 text-supportive" aria-hidden="true" />
            <span>The Discovery Catalog</span>
          </span>
          <span className="text-xs font-mono text-white/50">
            {totalCount > 0 ? `${totalCount}+ Stories` : "Live Catalog"}
          </span>
        </div>

        {/* Headline & Description */}
        <h2 className="mt-4 text-balance font-serif text-3xl font-semibold leading-[1.14] text-white sm:text-4xl lg:text-5xl">
          Dive into our full archive of independent journalism
        </h2>

        <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
          From investigative reporting to longform cultural essays, explore the complete repository across all categories with search and filters.
        </p>

        {/* Category Shortcut Pills */}
        {categories.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-xl">
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat.slug}
                href={`/content/${cat.slug}`}
                className="group flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.05] px-3.5 py-1 text-xs text-white/80 transition-all hover:border-primary/80 hover:bg-primary/25 hover:text-white"
              >
                <span>{cat.name}</span>
                {typeof cat.articleCount === "number" && cat.articleCount > 0 && (
                  <span className="text-[10px] text-white/50 group-hover:text-white/70">
                    ({cat.articleCount})
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}

        {/* Main CTA Pill Buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/content"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white px-8 py-3.5 text-sm font-semibold text-ink shadow-lg transition-all duration-200 hover:bg-white/95 hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(255,255,255,0.3)]"
          >
            <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>Explore All Dispatches &amp; Archives</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>

          <Link
            href="/search"
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/15 bg-white/[0.05] px-6 py-3.5 text-sm font-medium text-white/90 backdrop-blur-xs transition-all hover:border-white/30 hover:bg-white/10 hover:text-white"
          >
            <Search className="h-4 w-4 text-supportive" aria-hidden="true" />
            <span>Search Catalog (⌘K)</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
