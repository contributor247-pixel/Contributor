"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X, SearchX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSearchOverlay } from "@/hooks/use-search-overlay";
import { ArticleCard, type ArticleCardData } from "@/components/shared/ArticleCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonCard } from "@/components/shared/SkeletonCard";

interface SearchOverlayProps {
  popularPills: { name: string; slug: string }[];
}

export function SearchOverlay({ popularPills }: SearchOverlayProps) {
  const { isOpen, close } = useSearchOverlay();
  const prefersReducedMotion = useReducedMotion();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ArticleCardData[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const latestRequestId = useRef(0);

  const runSearch = (value: string) => {
    setSearchError(false);
    if (!value.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    // A slower earlier request can resolve after a faster later one,
    // overwriting fresh results with stale ones — this id guards
    // against that by only committing the response from the most
    // recently *issued* request.
    const requestId = ++latestRequestId.current;
    setIsLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(value)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Search unavailable");
        return res.json();
      })
      .then((data) => {
        if (requestId !== latestRequestId.current) return;
        setResults(data.results ?? []);
        setHasSearched(true);
      })
      .catch(() => {
        if (requestId !== latestRequestId.current) return;
        setSearchError(true);
      })
      .finally(() => {
        if (requestId !== latestRequestId.current) return;
        setIsLoading(false);
      });
  };

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(value), 300);
  };

  const handlePillClick = (name: string) => {
    setQuery(name);
    runSearch(name);
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
      setHasSearched(false);
      setSearchError(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key !== "Tab") return;
      const elements = Array.from(overlayRef.current?.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), input:not(:disabled)') ?? []);
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [isOpen, close]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    close();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label="Search articles"
          className="fixed inset-0 z-[60] flex flex-col overflow-y-auto overscroll-contain bg-white"
          style={{ minHeight: "90vh" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.01 : 0.15 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <motion.div
            className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-6 sm:px-6 sm:py-12"
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -8 }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex justify-end">
              <button
                type="button"
                onClick={close}
                aria-label="Close search"
                className="flex h-11 w-11 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-8">
              <label htmlFor="article-search" className="mb-4 block text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">Search Contributor</label>
              <input
                id="article-search"
                ref={inputRef}
                type="search"
                autoComplete="off"
                value={query}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Type here to search..."
                className="w-full border-b border-border-strong bg-transparent pb-4 font-serif text-3xl text-text-heading placeholder:text-text-muted outline-none focus:outline-none focus:ring-0 focus:border-ink sm:text-5xl"
              />
              <p className="mt-3 text-xs text-text-muted">Press Enter to see all results. Escape to close.</p>
            </form>

            {popularPills.length > 0 && !query.trim() && (
              <div className="mt-10 flex flex-col items-center gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
                  Popular searches
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {popularPills.map((pill) => (
                    <button
                      key={pill.slug}
                      type="button"
                      onClick={() => handlePillClick(pill.name)}
                      className="rounded-[4px] border border-border-strong px-4 py-2 text-sm font-medium text-text-body transition-colors hover:border-ink hover:text-ink"
                    >
                      {pill.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {query.trim() && (
              <p className="mt-8 break-words text-sm text-text-muted" role="status">
                {isLoading ? "Searching for " : "Results for "}<span className="font-medium text-text-heading">{query}</span>
              </p>
            )}

            <div className="mt-8" aria-busy={isLoading} onClick={(event) => {
              if ((event.target as HTMLElement).closest("a[href]")) close();
            }}>
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: prefersReducedMotion ? 0.01 : 0.15 }}
                    className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
                  >
                    {[0, 1, 2].map((i) => (
                      <SkeletonCard key={i} />
                    ))}
                  </motion.div>
                ) : searchError ? (
                  <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="alert" className="rounded-[4px] border border-border bg-bg-muted p-6">
                    <p className="font-medium text-text-heading">Search is temporarily unavailable</p>
                    <p className="mt-2 text-sm text-text-muted">Please try again in a moment.</p>
                    <button type="button" onClick={() => runSearch(query)} className="mt-4 min-h-11 rounded-[4px] bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-ink-soft">Try again</button>
                  </motion.div>
                ) : hasSearched && results.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: prefersReducedMotion ? 0.01 : 0.2 }}
                  >
                    <EmptyState
                      icon={SearchX}
                      headline={`No results for "${query}"`}
                      description="Try a different keyword or browse all content instead."
                      cta={{ label: "Browse all content", href: "/content" }}
                    />
                  </motion.div>
                ) : results.length > 0 ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: prefersReducedMotion ? 0.01 : 0.2 }}
                    className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
                  >
                    {results.map((article) => (
                      <div key={article.slug} onClick={close}>
                        <ArticleCard article={article} />
                      </div>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
