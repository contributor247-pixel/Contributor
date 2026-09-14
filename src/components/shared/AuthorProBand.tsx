import Link from "next/link";

interface AuthorProBandProps {
  // A real published cover image (the homepage's own hero article, so
  // no extra query) used as a moody photographic backdrop, per the
  // "no imagery below the hero" gap — the radial-glow-only version
  // read as flat/repetitive next to the newsletter band's identical
  // treatment. Optional: falls back to the plain oxblood-glow
  // treatment if no image is available.
  backdropImageUrl?: string | null;
}

// The homepage's AuthorPro CTA, pulled into its own component so it
// carries real texture (an oxblood duotone photo, matching AuthModal's
// dark-panel radial-glow language) rather than sitting as a flat solid
// rectangle — a plain bg-ink block in a sea of white space read as a
// placeholder banner, not an editorial moment.
export function AuthorProBand({ backdropImageUrl }: AuthorProBandProps) {
  return (
    <Link
      href="/dashboard/author"
      data-dark-surface
      className="group relative block overflow-hidden rounded-[4px] bg-ink"
    >
      {backdropImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- base64 cover, decorative backdrop
        <img
          src={backdropImageUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-[0.35] transition-transform duration-[600ms] ease-out group-hover:scale-105"
        />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(120%_100%_at_10%_15%,rgba(139,30,63,0.5),transparent_55%),linear-gradient(100deg,rgba(20,20,26,0.96)_25%,rgba(20,20,26,0.65)_70%)]"
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
