"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SocialIcon } from "@/components/shared/SocialIcon";

// Newsletter capture is out of scope for Phase 1 — this stub just
// simulates a submission so the UI is fully functional and testable
// ahead of any real list-provider integration.
function subscribeToNewsletter(_email: string): Promise<{ success: boolean }> {
  return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 600));
}

export function Footer() {
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
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="flex flex-col gap-6 border-b border-white/10 pb-12 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-serif text-2xl font-semibold sm:text-3xl">
              Get Inside the hustle.
            </h2>
            <p className="mt-2 max-w-md text-sm text-white/70">
              Subscribe to Contributor for the latest updates, insightful articles, and exclusive
              content delivered straight to your inbox. Join our community today!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full max-w-md lg:shrink-0">
            {status === "sent" ? (
              <p className="rounded-[4px] border border-success bg-white/5 px-4 py-3 text-sm text-white">
                Thanks — check your inbox to confirm your subscription.
              </p>
            ) : (
              <>
                <div className="flex h-12 items-stretch overflow-hidden rounded-[4px] border border-white/20 bg-white/5">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Please enter your e-mail address"
                    className="flex-1 bg-transparent px-4 text-sm text-white placeholder:text-white/50 focus:outline-none"
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
                <label className="mt-3 flex items-start gap-2 text-xs text-white/60">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-white/30 bg-transparent"
                  />
                  I have read and agree to the terms &amp; conditions
                </label>
                {error && <p className="mt-2 text-xs text-error">{error}</p>}
              </>
            )}
          </form>
        </div>

        <div className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/90">
              Contributor
            </h3>
            <p className="text-sm leading-relaxed text-white/60">
              Contributor is a publishing platform where writers share ideas and readers discover
              premium, editorially-driven content — free to read, or unlocked article by article,
              Publication by Publication, or platform-wide.
            </p>
            <Link
              href="/about"
              className="mt-4 inline-block text-sm font-medium text-white underline-offset-2 hover:underline"
            >
              Learn More
            </Link>
          </div>

          <FooterList title="Latest Contents" />
          <FooterFeatured />
          <FooterList title="Suggestions Contents" />
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <span className="font-serif text-lg font-semibold">Contributor</span>
          <p className="text-xs text-white/50">
            Contributor &copy; {new Date().getFullYear()} — All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-white/60">
            <Link href="/terms" className="hover:text-white">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/contact" className="hover:text-white">
              Contact
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <a href="#" aria-label="Facebook" className="text-white/60 hover:text-white">
              <SocialIcon name="facebook" className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Twitter" className="text-white/60 hover:text-white">
              <SocialIcon name="twitter" className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Instagram" className="text-white/60 hover:text-white">
              <SocialIcon name="instagram" className="h-4 w-4" />
            </a>
            <a href="#" aria-label="YouTube" className="text-white/60 hover:text-white">
              <SocialIcon name="youtube" className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterList({ title }: { title: string }) {
  // No article data source exists yet (Step 4/5 build article CRUD and
  // querying) — an honest empty state rather than fabricated placeholder
  // articles, consistent with docs/02_ThemeGuideline.md Section 8.4's
  // "no invented content" principle applied to a not-yet-populated list.
  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/90">{title}</h3>
      <p className="text-sm text-white/50">No articles published yet.</p>
    </div>
  );
}

function FooterFeatured() {
  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/90">Featured</h3>
      <p className="text-sm text-white/50">Nothing featured yet.</p>
    </div>
  );
}
