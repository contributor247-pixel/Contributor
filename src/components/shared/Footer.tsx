"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SocialIcon } from "@/components/shared/SocialIcon";
import type { ArticleCardData } from "@/components/shared/ArticleCard";

// Newsletter capture is out of scope for Phase 1 — this stub just
// simulates a submission so the UI is fully functional and testable
// ahead of any real list-provider integration.
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
      setError("Please agree to the terms and conditions.");
      return;
    }
    setStatus("sending");
    await subscribeToNewsletter(email);
    setStatus("sent");
  };

  return (
    <footer data-dark-surface className="bg-ink text-white">
      {/* Newsletter band gets the same oxblood radial-glow treatment as
          AuthModal's dark panel / AuthorProBand, so the footer's top
          section reads as one consistent "premium dark panel" language
          across the site rather than the one remaining flat black
          rectangle with no texture. */}
      <div className="relative overflow-hidden border-b border-white/10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_140%_at_12%_0%,rgba(139,30,63,0.28),transparent_60%),radial-gradient(50%_120%_at_92%_100%,rgba(139,30,63,0.16),transparent_55%)]"
        />
        <div className="relative mx-auto flex max-w-[1320px] flex-col gap-6 px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-subtle">
              The Contributor Brief
            </p>
            <h2 className="mt-3 max-w-md text-balance font-serif text-3xl font-semibold leading-[1.1] sm:text-4xl">
              One email, the stories worth your time.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/65">
              A short weekly note from the Editors — new Publications, Premium releases, and the
              pieces our own team keeps re-reading.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full max-w-md lg:shrink-0">
            {status === "sent" ? (
              <p className="rounded-[4px] border border-success bg-white/5 px-4 py-3 text-sm text-white">
                Thanks — check your inbox to confirm your subscription.
              </p>
            ) : (
              <>
                <div className="flex h-12 items-stretch overflow-hidden rounded-[4px] border border-white/20 bg-white/[0.06] backdrop-blur-sm focus-within:border-white/40">
                  <input
                    id="footer-newsletter-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="flex-1 bg-transparent px-4 text-sm text-white placeholder:text-white/45 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    aria-label="Subscribe"
                    className="flex w-12 items-center justify-center bg-primary text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <label htmlFor="footer-newsletter-agree" className="mt-3 flex items-start gap-2 text-xs text-white/55">
                  <input
                    id="footer-newsletter-agree"
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-white/30 bg-transparent"
                  />
                  I have read and agree to the terms &amp; conditions
                </label>
                {error && <p role="alert" className="mt-2 text-xs text-error">{error}</p>}
              </>
            )}
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element -- static asset in public/, not worth next/image's overhead for a fixed-size footer logo */}
            <img src="/logo/logo-dark.png" alt="Contributor" className="h-14 w-auto" />
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              A publishing platform where writers share ideas and readers discover premium,
              editorially-driven content — free to read, or unlocked article by article,
              Publication by Publication, or platform-wide.
            </p>
            <Link
              href="/about"
              className="-ml-2 mt-3 inline-flex min-h-11 items-center px-2 text-sm font-semibold text-primary-subtle underline-offset-2 hover:underline"
            >
              More about Contributor &rarr;
            </Link>
          </div>

          <FooterList title="Latest" articles={latest} />
          <FooterFeatured article={featured} />
          <FooterList title="Worth a Read" articles={suggestions} />
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="order-2 text-xs text-white/45 sm:order-1">
            Contributor &copy; {new Date().getFullYear()} — All rights reserved.
          </p>
          <div className="order-1 flex items-center gap-1 text-xs text-white/60 sm:order-2">
            <Link href="/terms" className="inline-flex min-h-11 items-center px-2 hover:text-white">
              Terms of Service
            </Link>
            <Link href="/privacy" className="inline-flex min-h-11 items-center px-2 hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/contact" className="inline-flex min-h-11 items-center px-2 hover:text-white">
              Contact
            </Link>
          </div>
          {/* No real Contributor social accounts exist yet — these are
              placeholder links (kept visible per explicit product
              decision, since a bare footer with no social row reads as
              even less finished at this stage) and must be pointed at
              the real profiles before launch. */}
          <div className="order-3 flex items-center gap-1">
            <a href="#" aria-label="Facebook" className="flex h-11 w-11 items-center justify-center text-white/50 transition-colors hover:text-primary-subtle">
              <SocialIcon name="facebook" className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Twitter" className="flex h-11 w-11 items-center justify-center text-white/50 transition-colors hover:text-primary-subtle">
              <SocialIcon name="twitter" className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Instagram" className="flex h-11 w-11 items-center justify-center text-white/50 transition-colors hover:text-primary-subtle">
              <SocialIcon name="instagram" className="h-4 w-4" />
            </a>
            <a href="#" aria-label="YouTube" className="flex h-11 w-11 items-center justify-center text-white/50 transition-colors hover:text-primary-subtle">
              <SocialIcon name="youtube" className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Shared small-caps column header with the same oxblood rule marker
// used by HomeHero's eyebrow, so every footer column reads as one
// deliberate typographic system instead of a plain uppercase label.
function FooterColumnTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
      <span className="h-px w-4 bg-primary" aria-hidden="true" />
      {children}
    </h3>
  );
}

function FooterList({ title, articles }: { title: string; articles: ArticleCardData[] }) {
  return (
    <div>
      <FooterColumnTitle>{title}</FooterColumnTitle>
      {articles.length === 0 ? (
        <p className="text-sm leading-relaxed text-white/40">
          Nothing here yet — the first stories are still being written.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-white/[0.06]">
          {articles.map((article) => (
            <li key={article.slug}>
              <Link
                href={`/article/${article.slug}`}
                className="-mx-2 flex min-h-11 items-center px-2 py-2 text-sm text-white/70 transition-colors hover:text-primary-subtle"
              >
                <span className="line-clamp-2">{article.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FooterFeatured({ article }: { article: ArticleCardData | null }) {
  return (
    <div>
      <FooterColumnTitle>Featured</FooterColumnTitle>
      {!article ? (
        <p className="text-sm leading-relaxed text-white/40">
          Reserved for the story our Editors pick next.
        </p>
      ) : (
        <Link href={`/article/${article.slug}`} className="group block">
          <div className="aspect-[3/4] w-full overflow-hidden rounded-[4px] bg-white/10">
            {article.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- base64 cover
              <img
                src={article.coverImageUrl}
                alt={article.title}
                className="h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center px-3 text-center text-xs text-white/40">
                {article.category.name}
              </div>
            )}
          </div>
          <p className="mt-3 line-clamp-2 text-sm font-medium text-white/90 transition-colors group-hover:text-white">
            {article.title}
          </p>
        </Link>
      )}
    </div>
  );
}
