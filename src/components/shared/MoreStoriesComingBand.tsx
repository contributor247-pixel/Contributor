import Link from "next/link";

// Shown on the homepage only while there isn't yet enough content to
// fill the "More Stories"/Editor's Picks/"Latest" grids (each needs 6+
// articles past the hero+rail before it renders at all — see
// (marketing)/page.tsx's gridA/editorsFeatured/gridB/gridC slicing).
// Without this, an early-stage site with only a couple of articles
// left a large dead gap of plain white space between the AuthorPro
// band and the footer — this fills it with an honest, on-brand
// editorial moment instead of a section that looks broken or
// unfinished, per the "confident editorial magazine" brand mood
// (docs/02_ThemeGuideline.md Section 1) rather than a generic "empty
// state" apology.
export function MoreStoriesComingBand() {
  return (
    <section className="border-y border-border bg-bg-muted">
      <div className="mx-auto max-w-[1320px] px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
          Just getting started
        </p>
        <h2 className="mx-auto mt-4 max-w-xl text-balance font-serif text-3xl font-semibold leading-tight text-text-heading sm:text-4xl">
          More stories are on their way.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-text-muted">
          Contributor is early — every Author publishing today shapes what this magazine becomes. Check back soon, or be one of the first to write for it.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/content"
            className="inline-flex h-11 items-center rounded-[4px] bg-ink px-6 text-sm font-semibold text-white transition-colors hover:bg-primary"
          >
            Browse what&apos;s published
          </Link>
          <Link
            href="/dashboard/author/articles/new"
            className="inline-flex h-11 items-center rounded-[4px] border border-border-strong px-6 text-sm font-semibold text-text-body transition-colors hover:bg-white"
          >
            Write the next one
          </Link>
        </div>
      </div>
    </section>
  );
}
