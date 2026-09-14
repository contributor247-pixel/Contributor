import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { getRecentArticles } from "@/lib/queries/articles";

// Sits at the app root, outside (marketing)'s own layout — so unlike
// every other page in the app, it previously rendered with no Navbar/
// Footer at all: a dead end with a single "Back to Homepage" link and
// no way to search, browse, or navigate anywhere else. Fixed by
// rendering the same chrome (marketing)/layout.tsx provides, including
// real "Latest Contents" in the footer — exactly the kind of thing
// worth surfacing to someone who just hit a broken link.
export default async function NotFound() {
  const recent = await getRecentArticles(9);
  const latest = recent.slice(0, 4);
  const featured = recent[4] ?? null;
  const suggestions = recent.slice(5, 9);

  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
          <FileQuestion className="mb-4 h-12 w-12 text-text-muted" aria-hidden="true" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">404</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-text-heading">Page not found</h1>
          <p className="mt-2 max-w-sm text-sm text-text-muted">
            This page doesn&apos;t exist, or is no longer available.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex h-11 items-center rounded-[4px] bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-primary"
            >
              Back to Homepage
            </Link>
            <Link
              href="/content"
              className="inline-flex h-11 items-center rounded-[4px] border border-border-strong px-5 text-sm font-semibold text-text-body transition-colors hover:bg-bg-muted"
            >
              Browse articles
            </Link>
          </div>
        </div>
      </main>
      <Footer latest={latest} featured={featured} suggestions={suggestions} />
    </>
  );
}
