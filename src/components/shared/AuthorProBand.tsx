import Link from "next/link";
import { Sparkles, DollarSign, Lock, ArrowRight, ShieldCheck, PenSquare, TrendingUp } from "lucide-react";

interface AuthorProBandProps {
  backdropImageUrl?: string | null;
}

export function AuthorProBand({ backdropImageUrl }: AuthorProBandProps) {
  return (
    <div
      data-dark-surface
      className="group relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-ink via-ink to-ink-soft p-8 shadow-2xl sm:p-12 lg:p-16"
    >
      {backdropImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- base64 cover
        <img
          src={backdropImageUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-[0.20] transition-transform duration-700 ease-out group-hover:scale-105"
        />
      )}

      {/* Layered ambient lighting glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(100%_100%_at_10%_20%,rgba(139,30,63,0.55),transparent_65%),radial-gradient(70%_70%_at_90%_80%,rgba(217,119,6,0.18),transparent_60%),linear-gradient(135deg,rgba(20,20,26,0.98)_0%,rgba(20,20,26,0.85)_100%)]"
      />

      {/* Inner ambient luxury border */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-3 rounded-2xl border border-white/[0.08] sm:inset-5"
      />

      <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Value Proposition & Feature Highlights */}
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-supportive/50 bg-supportive/20 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-supportive-subtle backdrop-blur-xs">
              <Sparkles className="h-3.5 w-3.5 text-supportive" aria-hidden="true" />
              AuthorPro Suite
            </span>
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
              For Independent Writers &amp; Publications
            </span>
          </div>

          <h2 className="mt-5 text-balance font-serif text-3xl font-semibold leading-[1.12] text-white sm:text-4xl lg:text-5xl">
            Publish without gatekeepers. Monetize directly from your audience.
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
            Keep up to 90% of your earnings. Offer free-to-read dispatches, single article unlocks, or recurring publication memberships with instant Stripe payouts.
          </p>

          {/* Feature Highlight Pills */}
          <div className="mt-6 flex flex-wrap gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-xs font-medium text-white/90 backdrop-blur-md shadow-xs">
              <DollarSign className="h-3.5 w-3.5 text-supportive" aria-hidden="true" />
              <span>90% Creator Revenue Share</span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-xs font-medium text-white/90 backdrop-blur-md shadow-xs">
              <Lock className="h-3.5 w-3.5 text-primary-subtle" aria-hidden="true" />
              <span>Custom Paywall Unlocks</span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-xs font-medium text-white/90 backdrop-blur-md shadow-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-success" aria-hidden="true" />
              <span>100% Creator Copyright</span>
            </span>
          </div>
        </div>

        {/* Right: Interactive CTA Card */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center lg:flex-col lg:items-end lg:shrink-0">
          <Link
            href="/dashboard/author/articles/new"
            className="inline-flex items-center justify-center gap-2.5 rounded-full border border-white/20 bg-white px-8 py-4 text-sm font-semibold text-ink shadow-xl transition-all duration-200 hover:bg-white/95 hover:scale-[1.02] hover:shadow-[0_0_28px_rgba(255,255,255,0.35)]"
          >
            <PenSquare className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>Start Writing Today</span>
            <ArrowRight className="h-4 w-4 text-ink" aria-hidden="true" />
          </Link>

          <Link
            href="/about"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-6 py-2.5 text-xs font-medium text-white/90 backdrop-blur-xs transition-all hover:border-white/40 hover:bg-white/15 hover:text-white"
          >
            <TrendingUp className="h-3.5 w-3.5 text-supportive" aria-hidden="true" />
            <span>Explore publisher terms &amp; earnings &rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

