import Link from "next/link";

// The homepage's AuthorPro CTA, pulled into its own component since it
// now carries real texture (matching AuthModal's dark-panel radial-glow
// treatment, src/components/shared/AuthModal.tsx's DarkPanel) rather
// than sitting as a flat solid rectangle — a plain bg-ink block in a
// sea of white space read as a placeholder banner, not an editorial
// moment, per the "confident editorial magazine" brand mood.
export function AuthorProBand() {
  return (
    <Link
      href="/dashboard/author"
      data-dark-surface
      className="group relative block overflow-hidden rounded-[4px] bg-ink"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(139,30,63,0.35),transparent_55%),radial-gradient(circle_at_85%_90%,rgba(139,30,63,0.2),transparent_50%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-4 rounded-[2px] border border-white/[0.08] sm:inset-6"
      />
      <div className="relative flex flex-col items-start gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-14">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-subtle">
            AuthorPro
          </p>
          <h2 className="mt-3 text-balance font-serif text-3xl font-semibold leading-[1.1] text-white sm:text-4xl">
            Write premium stories, earn from every reader who unlocks them.
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/65">
            Publish free to read or gate it article by article — you set the price, we handle the payments.
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 rounded-[4px] bg-white px-6 py-3 text-sm font-semibold text-ink transition-transform duration-200 group-hover:scale-[1.03]">
          Start writing
          <span aria-hidden="true">&rarr;</span>
        </span>
      </div>
    </Link>
  );
}
