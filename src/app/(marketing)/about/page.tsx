import Link from "next/link";
import type { Metadata } from "next";
import { PenLine, Layers, ShieldCheck, Sparkles } from "lucide-react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description:
    "Contributor is a publishing platform where writers share ideas and readers discover premium, editorially-driven content.",
  path: "/about",
});

const PRINCIPLES = [
  {
    eyebrow: "For Readers",
    title: "Free stories, and Premium ones worth paying for",
    description:
      "Most of what's published here is free to read. When something's gated, it's priced per article, per Publication, or platform-wide — never a paywall you didn't choose.",
    icon: Sparkles,
  },
  {
    eyebrow: "For Authors",
    title: "You set the price, we handle the payments",
    description:
      "Publish free or Premium, write solo or with a Publication, and keep a real, transparent share of every purchase and subscription — no opaque revenue math.",
    icon: PenLine,
  },
  {
    eyebrow: "For Publications",
    title: "A masthead for more than one writer",
    description:
      "Publications let a group of Authors write under one shared name, with their own subscribers and their own revenue split — a magazine, not just a feed.",
    icon: Layers,
  },
  {
    eyebrow: "For Everyone",
    title: "Moderated, not just monetized",
    description:
      "Every article can be reported, every report is reviewed by a real person, and every reader can see exactly what a Premium article costs before they unlock it.",
    icon: ShieldCheck,
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero statement + photo collage — structure follows
          Refrence/about (2).png's opening section (headline left,
          layered photo cluster right), rendered in our own oxblood/ink
          palette and real Contributor copy rather than the reference's
          colors or stock content, per docs/02_ThemeGuideline.md's
          "follow structure, not color" instruction. */}
      <section className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Who We Are
            </p>
            <h1 className="mt-4 text-balance font-serif text-4xl font-semibold leading-[1.1] text-text-heading sm:text-5xl">
              A magazine built for writers who want to be paid, and readers who want to pay for something worth reading.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-text-muted">
              Contributor connects independent writers with readers who want more than a feed —
              free stories to discover, Premium ones worth unlocking, and Publications built by
              more than one voice. Every piece is written by a real Author, reviewed if it's
              reported, and priced honestly.
            </p>
          </div>
          <div className="relative mx-auto grid h-[340px] w-full max-w-md grid-cols-2 gap-3 sm:h-[400px]">
            <div className="col-span-2 overflow-hidden rounded-[4px]">
              {/* eslint-disable-next-line @next/next/no-img-element -- static asset */}
              <img
                src="/about/vineyard.jpg"
                alt="A hillside vineyard at golden hour"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="overflow-hidden rounded-[4px]">
              {/* eslint-disable-next-line @next/next/no-img-element -- static asset */}
              <img
                src="/about/dining.jpg"
                alt="A table set for lunch on a stone terrace"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="overflow-hidden rounded-[4px]">
              {/* eslint-disable-next-line @next/next/no-img-element -- static asset */}
              <img
                src="/about/sunset.jpg"
                alt="A countryside estate at sunset"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Story — split section, photo left / copy right, matching
          the reference's second section. */}
      <section className="bg-bg-muted">
        <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:py-24">
          <div className="overflow-hidden rounded-[4px]">
            {/* eslint-disable-next-line @next/next/no-img-element -- static asset */}
            <img
              src="/about/dining.jpg"
              alt="Writers and editors reviewing a story together"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Our Story
            </p>
            <h2 className="mt-3 text-balance font-serif text-3xl font-semibold leading-[1.15] text-text-heading sm:text-4xl">
              Contributor started with a simple complaint: writing well and getting paid for it shouldn't require a platform's permission.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-text-muted">
              Most publishing platforms make you choose between reach and revenue — free and
              invisible, or paywalled and unread. Contributor was built to remove that trade-off:
              every Author decides what's free, what's Premium, and what it costs, article by
              article.
            </p>
          </div>
        </div>
      </section>

      {/* How We're Different — 4-up feature grid, matching the
          reference's "How We're Different" section structure. */}
      <section className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mb-10 max-w-lg lg:mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            What We Do
          </p>
          <h2 className="mt-3 text-balance font-serif text-3xl font-semibold leading-[1.15] text-text-heading sm:text-4xl">
            How We&apos;re Different
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {PRINCIPLES.map((p) => (
            <div key={p.title}>
              <p.icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
                {p.eyebrow}
              </p>
              <h3 className="mt-1.5 font-serif text-lg font-semibold leading-snug text-text-heading">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">{p.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Full-bleed photo + closing CTA band — matches the reference's
          large photo-then-color-band closing pattern, in our own
          oxblood instead of the reference's red, with the AuthorPro
          radial-glow language already established on the homepage
          (AuthorProBand) rather than a flat color fill. */}
      <div className="relative h-[46vh] min-h-[320px] w-full overflow-hidden sm:h-[56vh]">
        {/* eslint-disable-next-line @next/next/no-img-element -- static asset */}
        <img
          src="/about/sunset.jpg"
          alt="A countryside estate at sunset"
          className="h-full w-full object-cover"
        />
      </div>
      <section data-dark-surface className="relative overflow-hidden bg-ink">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_140%_at_50%_0%,rgba(139,30,63,0.3),transparent_65%)]"
        />
        <div className="relative mx-auto max-w-[1320px] px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
          <h2 className="mx-auto max-w-2xl text-balance font-serif text-3xl font-semibold leading-[1.15] text-white sm:text-4xl">
            Join a magazine where every writer keeps their voice, and every reader chooses what&apos;s worth paying for.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/70">
            Read for free, subscribe to a Publication you trust, or start writing today — Contributor
            is built to grow with the people on it, not around them.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/content"
              className="inline-flex h-11 items-center rounded-[4px] bg-white px-6 text-sm font-semibold text-ink transition-colors hover:bg-primary-subtle"
            >
              Start reading
            </Link>
            <Link
              href="/dashboard/author/articles/new"
              className="inline-flex h-11 items-center rounded-[4px] border border-white/25 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Start writing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
