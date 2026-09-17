import Link from "next/link";
import type { Metadata } from "next";
import {
  PenLine,
  Layers,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Coins,
  Users,
  BookOpen,
  ArrowUpRight,
} from "lucide-react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description:
    "Contributor is an editorial publishing platform where independent writers share ideas and readers discover premium, longform dispatches.",
  path: "/about",
});

const METRICS = [
  {
    value: "80%",
    label: "Direct Writer Revenue",
    description: "Paid directly to writers on every article unlock & subscription.",
  },
  {
    value: "100%",
    label: "Human Editorial Integrity",
    description: "Every dispatch is moderated by real people with transparent policies.",
  },
  {
    value: "3-Tier",
    label: "Reader Choice",
    description: "Read free, buy single dispatches, or subscribe to publications.",
  },
  {
    value: "0",
    label: "Ad Trackers & Popups",
    description: "Pure distraction-free typography crafted for deep contemplation.",
  },
];

const PRINCIPLES = [
  {
    eyebrow: "For Readers",
    title: "Free stories, and Premium ones worth paying for",
    description:
      "Most dispatches are free to read. When an essay is gated, it is priced per article, per Publication, or platform-wide — never an opaque paywall you didn't choose.",
    icon: Sparkles,
  },
  {
    eyebrow: "For Authors",
    title: "You set the price, we handle the payments",
    description:
      "Publish free or Premium, write solo or with a Publication masthead, and keep a real, transparent share of every purchase — no obscure algorithmic payout formulas.",
    icon: PenLine,
  },
  {
    eyebrow: "For Publications",
    title: "A masthead for collective storytelling",
    description:
      "Publications allow groups of authors to write under one shared banner, with their own subscribers, custom branding, and shared revenue splits.",
    icon: Layers,
  },
  {
    eyebrow: "For Everyone",
    title: "Moderated, not just monetized",
    description:
      "Every article can be reported, every report is reviewed by real moderators, and every reader sees exactly what a Premium story costs before unlocking it.",
    icon: ShieldCheck,
  },
];

const MANIFESTO_PILLARS = [
  "No programmatic ad banners or clickbait noise",
  "Authors own 100% of their intellectual property",
  "Transparent 70/30 revenue splits with Stripe Connect",
  "Collaborative multi-author publication mastheads",
  "Fast, magazine-grade typography designed for deep reading",
];

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-bg text-text-body">
      {/* 1. Hero Statement & Asymmetric Editorial Visual Cluster */}
      <section className="relative mx-auto max-w-[1320px] px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20 lg:px-8 lg:pt-20 lg:pb-28">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
          {/* Hero Left: Narrative & CTAs */}
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Who We Are</span>
            </div>

            <h1 className="mt-5 font-serif text-4xl font-semibold leading-[1.12] tracking-tight text-text-heading sm:text-5xl lg:text-[3.4rem]">
              A magazine built for writers who love their craft, and readers who value good thinking.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-text-muted sm:text-lg">
              Contributor connects independent journalists, essayists, and collective publications
              directly with readers who crave depth. Every dispatch is written by a verified
              author, priced honestly, and designed for focused contemplation.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Link
                href="/content"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-hover hover:shadow-md active:scale-[0.98]"
              >
                <span>Explore Dispatches</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard/author/articles/new"
                className="inline-flex items-center gap-2 rounded-full border border-border/90 bg-surface px-6 py-3 text-sm font-semibold text-text-heading shadow-xs transition-all hover:border-primary/40 hover:text-primary hover:shadow-xs active:scale-[0.98]"
              >
                <PenLine className="h-4 w-4 text-primary" />
                <span>Start Writing</span>
              </Link>
            </div>
          </div>

          {/* Hero Right: Layered Photographic Grid */}
          <div className="lg:col-span-6">
            <div className="relative mx-auto grid max-w-lg grid-cols-2 gap-3.5 sm:max-w-xl">
              {/* Main Top Image */}
              <div className="group relative col-span-2 overflow-hidden rounded-2xl border border-border/80 shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element -- editorial visual */}
                <img
                  src="/about/editorial_newsroom.jpg"
                  alt="Editorial team and writers collaborating in a modern studio"
                  className="h-56 w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:h-64"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                  <span className="font-semibold tracking-wide">The Contributor Newsroom</span>
                  <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] backdrop-blur-sm">
                    Est. 2026
                  </span>
                </div>
              </div>

              {/* Bottom Left Image */}
              <div className="group relative overflow-hidden rounded-2xl border border-border/80 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element -- editorial visual */}
                <img
                  src="/about/writer_crafting.jpg"
                  alt="Author reviewing manuscripts in a study"
                  className="h-40 w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:h-48"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
                <span className="absolute bottom-2.5 left-3 text-[11px] font-medium text-white/90">
                  Independent Voices
                </span>
              </div>

              {/* Bottom Right Image */}
              <div className="group relative overflow-hidden rounded-2xl border border-border/80 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element -- editorial visual */}
                <img
                  src="/about/craftsmanship_press.jpg"
                  alt="Editorial print craftsmanship and typography workbench"
                  className="h-40 w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:h-48"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
                <span className="absolute bottom-2.5 left-3 text-[11px] font-medium text-white/90">
                  Typography & Craft
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Platform Impact & Integrity Numbers Band */}
      <section className="border-y border-border/80 bg-surface/70 py-12">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {METRICS.map((item, idx) => (
              <div
                key={idx}
                className="relative flex flex-col justify-between border-l-2 border-primary/30 pl-5 sm:border-l sm:pl-6"
              >
                <div>
                  <span className="font-serif text-3xl font-bold tracking-tight text-text-heading lg:text-4xl">
                    {item.value}
                  </span>
                  <h4 className="mt-1 text-sm font-semibold text-text-heading">
                    {item.label}
                  </h4>
                  <p className="mt-1.5 text-xs leading-relaxed text-text-muted">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. The Story & Manifesto (Split Section) */}
      <section className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
          {/* Visual with Overlay Pull-Quote */}
          <div className="relative lg:col-span-5">
            <div className="overflow-hidden rounded-2xl border border-border/80 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element -- editorial visual */}
              <img
                src="/about/writer_crafting.jpg"
                alt="An author writing and editing an article"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            {/* Pull-quote card — a clean separate block below the
                image, not overlapping it. An earlier negative-margin
                overlay (first -mt-8, then -mt-3) consistently read as
                an accidental collision rather than an intentional
                design touch, so the overlap is dropped entirely. */}
            <div className="mt-5 rounded-2xl border border-border/80 bg-surface p-5 shadow-sm">
              <p className="font-serif text-sm italic leading-relaxed text-text-heading">
                &ldquo;Writing well and getting paid for it should never require an algorithm&apos;s permission.&rdquo;
              </p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-primary">
                Contributor Manifesto
              </p>
            </div>
          </div>

          {/* Story Narrative & Checklist */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <span>Our Story & Philosophy</span>
            </div>

            <h2 className="mt-3 font-serif text-3xl font-semibold leading-[1.18] text-text-heading sm:text-4xl">
              Most platforms make you choose between reach and revenue. We built Contributor to end that false trade-off.
            </h2>

            <p className="mt-4 text-sm leading-relaxed text-text-muted sm:text-base">
              Traditional publishing forced writers into two broken models: write for free to build
              an audience, or lock everything behind aggressive subscription paywalls where no new
              readers ever discover you.
            </p>

            <p className="mt-3 text-sm leading-relaxed text-text-muted sm:text-base">
              Contributor was engineered with micro-paywalls, custom publication mastheads, and
              direct Stripe payouts. Authors decide what is free and what is premium on a piece-by-piece
              basis. Readers can unlock a single insightful dispatch for $1 or subscribe to a publication
              they love.
            </p>

            {/* Checklist of Principles */}
            <div className="mt-6 grid grid-cols-1 gap-2.5 pt-4 border-t border-border/70 sm:grid-cols-2">
              {MANIFESTO_PILLARS.map((pillar, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                  <span className="text-xs font-medium text-text-heading">{pillar}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. "How We're Different" - 4 High-Attention Feature Cards */}
      <section className="border-t border-border/80 bg-surface/40 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <span>What We Do</span>
            </div>
            <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-text-heading sm:text-4xl">
              Engineered for quality, sustainability, and trust
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-text-muted sm:text-base">
              Every feature on Contributor is built to align the incentives of authors, publications,
              and readers in perfect harmony.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PRINCIPLES.map((p, idx) => (
              <div
                key={idx}
                className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-surface p-7 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
              >
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-white shadow-xs">
                    <p.icon className="h-5 w-5" aria-hidden="true" />
                  </div>

                  <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                    {p.eyebrow}
                  </p>

                  <h3 className="mt-2 font-serif text-lg font-semibold leading-snug text-text-heading transition-colors group-hover:text-primary">
                    {p.title}
                  </h3>

                  <p className="mt-2.5 text-xs leading-relaxed text-text-muted">
                    {p.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-[11px] font-semibold text-text-muted group-hover:text-primary transition-colors">
                  <span>Learn more</span>
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Full-Bleed Grand Photography Interlude */}
      <section className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="relative h-[360px] w-full overflow-hidden rounded-3xl border border-border/80 shadow-md sm:h-[460px]">
          {/* eslint-disable-next-line @next/next/no-img-element -- static asset */}
          <img
            src="/about/modern_library.jpg"
            alt="A grand modern architectural library hall with readers and literature"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 max-w-xl text-white sm:bottom-10 sm:left-10">
            <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
              The Architecture of Thought
            </span>
            <h3 className="mt-3 font-serif text-2xl font-semibold leading-snug sm:text-3xl">
              &ldquo;A great publication is not an echo chamber, but a sanctuary for independent inquiry.&rdquo;
            </h3>
          </div>
        </div>
      </section>

      {/* 6. Closing Invitation Band */}
      <section data-dark-surface className="relative overflow-hidden bg-ink py-20 sm:py-24 lg:py-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_140%_at_50%_0%,rgba(139,30,63,0.35),transparent_65%)]"
        />
        <div className="relative mx-auto max-w-[1320px] px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
            <Sparkles className="h-3.5 w-3.5 text-supportive" />
            <span>Join the Masthead</span>
          </div>

          <h2 className="mx-auto mt-6 max-w-3xl font-serif text-3xl font-semibold leading-[1.15] text-white sm:text-4xl lg:text-5xl">
            Join a publishing community where craft is respected and good writing is rewarded.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
            Read for free, subscribe to independent publications you trust, or publish your own dispatches today. Contributor grows with the people who write on it.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            <Link
              href="/content"
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-7 text-sm font-semibold text-ink shadow-md transition-all hover:bg-primary-subtle hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Reading Dispatches
            </Link>
            <Link
              href="/dashboard/author/articles/new"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 bg-white/5 px-7 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/15 hover:border-white/50 active:scale-[0.98]"
            >
              Start Writing as an Author
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
