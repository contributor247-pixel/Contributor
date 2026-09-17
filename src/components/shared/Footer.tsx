"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUp, CheckCircle, Clock, Globe, Shield, Sparkles } from "lucide-react";
import { SocialIcon } from "@/components/shared/SocialIcon";
import type { ArticleCardData } from "@/components/shared/ArticleCard";

function subscribeToNewsletter(_email: string): Promise<{ success: boolean }> {
  return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 600));
}

interface FooterProps {
  latest: ArticleCardData[];
  featured: ArticleCardData | null;
  suggestions: ArticleCardData[];
}

export function Footer({ latest, featured, suggestions }: FooterProps) {
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }
    if (!agreed) {
      setError("Please agree to receive our weekly editorial brief.");
      return;
    }
    setStatus("sending");
    await subscribeToNewsletter(email);
    setStatus("sent");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer data-dark-surface className="border-t border-white/10 bg-ink text-white">
      {/* 1. Newsletter Hub: The Contributor Brief */}
      <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-ink-soft via-ink to-ink-soft">
        {/* Layered ambient glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_120%_at_12%_10%,rgba(139,30,63,0.35),transparent_65%),radial-gradient(40%_80%_at_88%_90%,rgba(217,119,6,0.14),transparent_60%)]"
        />

        <div className="relative mx-auto flex max-w-[1320px] flex-col gap-8 px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-18">
          <div className="max-w-xl">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-supportive/40 bg-supportive/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-supportive-subtle">
                <Sparkles className="h-3 w-3 text-supportive" aria-hidden="true" />
                The Contributor Brief
              </span>
              <span className="text-xs text-white/50">Delivered Every Sunday</span>
            </div>

            <h2 className="mt-3 text-balance font-serif text-3xl font-semibold leading-[1.12] sm:text-4xl">
              One weekly email. The stories truly worth your attention.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Join 48,000+ curious readers receiving curated dispatches, longform essays, and newly published author series — zero spam, ever.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full max-w-md lg:shrink-0">
            {status === "sent" ? (
              <div className="flex items-center gap-3 rounded-xl border border-success/60 bg-success/10 px-4 py-3.5 text-sm text-white">
                <CheckCircle className="h-5 w-5 text-success shrink-0" aria-hidden="true" />
                <p>You&apos;re subscribed. Look out for the next Sunday edition!</p>
              </div>
            ) : (
              <>
                <div className="flex h-[54px] items-stretch overflow-hidden rounded-full border border-white/20 bg-white/[0.06] p-1 backdrop-blur-sm transition-all focus-within:border-supportive/70 focus-within:ring-1 focus-within:ring-supportive/40">
                  <input
                    id="footer-newsletter-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="flex-1 bg-transparent px-4 text-sm text-white placeholder:text-white/45 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    aria-label="Subscribe to newsletter"
                    className="flex items-center gap-1.5 rounded-full bg-primary px-5 text-xs font-semibold text-white transition-all hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span>{status === "sending" ? "Joining..." : "Subscribe"}</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
                <label htmlFor="footer-newsletter-agree" className="mt-3 flex items-start gap-2 text-xs text-white/60">
                  <input
                    id="footer-newsletter-agree"
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-white/30 bg-transparent text-primary accent-primary"
                  />
                  <span>I agree to receive the weekly brief and accept the privacy policy.</span>
                </label>
                {error && <p role="alert" className="mt-2 text-xs text-error">{error}</p>}
              </>
            )}
          </form>
        </div>
      </div>

      {/* 2. Main Directory Columns */}
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 py-16 sm:grid-cols-2 lg:grid-cols-5">
          {/* Col 1: Brand & Live Status */}
          <div className="lg:col-span-2 pr-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- static logo */}
            <img src="/logo/logo-dark.png" alt="Contributor" className="h-12 w-auto" />
            <p className="mt-4 text-sm leading-relaxed text-white/65 max-w-sm">
              An independent publishing ecosystem where writers own their audience and readers discover verified, editorially vetted storytelling without algorithmic noise.
            </p>

            {/* Live Operational Status Indicator */}
            <div className="mt-6 flex flex-col gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-white/80 w-fit">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse-dot" />
                <span>All Platform Systems Operational</span>
              </div>
              <p className="text-[11px] text-white/50">
                100% Ad-Free &bull; Creator Copyright Protected
              </p>
            </div>
          </div>

          {/* Col 2: Navigation & Topics */}
          <div>
            <FooterColumnTitle>Explore</FooterColumnTitle>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <Link href="/content" className="text-white/70 transition-colors hover:text-white hover:translate-x-0.5 inline-block">
                  All Dispatches
                </Link>
              </li>
              <li>
                <Link href="/content/culture" className="text-white/70 transition-colors hover:text-white hover:translate-x-0.5 inline-block">
                  Culture &amp; Ideas
                </Link>
              </li>
              <li>
                <Link href="/content/technology" className="text-white/70 transition-colors hover:text-white hover:translate-x-0.5 inline-block">
                  Technology &amp; Future
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white/70 transition-colors hover:text-white hover:translate-x-0.5 inline-block">
                  About the Platform
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: For Writers & Publishers */}
          <div>
            <FooterColumnTitle>For Writers</FooterColumnTitle>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <Link href="/dashboard/author/articles/new" className="text-supportive-subtle font-medium transition-colors hover:text-white inline-flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-supportive" />
                  Start Writing
                </Link>
              </li>
              <li>
                <Link href="/dashboard/author" className="text-white/70 transition-colors hover:text-white inline-block">
                  Author Studio
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white/70 transition-colors hover:text-white inline-block">
                  Monetization Terms
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/70 transition-colors hover:text-white inline-block">
                  Editorial Guidelines
                </Link>
              </li>
              <li>
                <Link href="/dashboard/author/billing" className="text-white/70 transition-colors hover:text-white inline-block">
                  Stripe Payouts
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Featured / Suggestions */}
          <div>
            <FooterFeatured article={featured} />
          </div>
        </div>

        {/* 3. Utility & City Edition Clocks Bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 text-xs text-white/50 sm:flex-row">
          <div className="flex items-center gap-3">
            <Globe className="h-3.5 w-3.5 text-white/40" aria-hidden="true" />
            <span>Global Editions: <strong>NYC</strong> &bull; <strong>LON</strong> &bull; <strong>TYO</strong></span>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Back to top of page"
            className="group inline-flex h-11 items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.04] px-4 text-xs text-white/80 transition-all hover:border-white/40 hover:bg-white/10 hover:text-white"
          >
            <span>Back to top</span>
            <ArrowUp className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" aria-hidden="true" />
          </button>
        </div>

        {/* 4. Bottom Legal & Socials Row */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/[0.08] py-8 sm:flex-row">
          <p className="order-2 text-xs text-white/45 sm:order-1">
            Contributor &copy; {new Date().getFullYear()} &mdash; Independent Journalism &amp; Publishing Platform.
          </p>

          <div className="order-1 flex items-center gap-4 text-xs text-white/60 sm:order-2">
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms
            </Link>
            <span className="text-white/20">&bull;</span>
            <Link href="/privacy" className="transition-colors hover:text-white">
              Privacy
            </Link>
            <span className="text-white/20">&bull;</span>
            <Link href="/contact" className="transition-colors hover:text-white">
              Contact
            </Link>
          </div>

          <div className="order-3 flex items-center gap-1.5">
            <a
              href="#"
              aria-label="Facebook"
              className="flex h-11 w-11 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-supportive-subtle"
            >
              <SocialIcon name="facebook" className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="Twitter"
              className="flex h-11 w-11 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-supportive-subtle"
            >
              <SocialIcon name="twitter" className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="flex h-11 w-11 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-supportive-subtle"
            >
              <SocialIcon name="instagram" className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="YouTube"
              className="flex h-11 w-11 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-supportive-subtle"
            >
              <SocialIcon name="youtube" className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumnTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
      <span className="h-px w-3 bg-primary" aria-hidden="true" />
      {children}
    </h3>
  );
}

function FooterFeatured({ article }: { article: ArticleCardData | null }) {
  return (
    <div>
      <FooterColumnTitle>Featured Dispatch</FooterColumnTitle>
      {!article ? (
        <p className="text-xs leading-relaxed text-white/50">
          The next curated selection will appear here shortly.
        </p>
      ) : (
        <Link href={`/article/${article.slug}`} className="group block">
          <div className="aspect-[16/10] w-full overflow-hidden rounded-xl bg-white/10 border border-white/10">
            {article.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- base64 cover
              <img
                src={article.coverImageUrl}
                // Empty alt: this image and the title text below it
                // sit inside the SAME Link (unlike ArticleCard/
                // EditorsPicks, which use two separate links), so a
                // non-empty alt here would make the one link's
                // accessible name announce the title twice.
                alt=""
                className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center px-3 text-center text-xs text-white/50">
                {article.category.name}
              </div>
            )}
          </div>
          <p className="mt-2.5 line-clamp-2 text-xs font-medium text-white/80 transition-colors group-hover:text-white">
            {article.title}
          </p>
        </Link>
      )}
    </div>
  );
}

