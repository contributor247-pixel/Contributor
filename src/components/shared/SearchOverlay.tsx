"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X, SearchX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSearchOverlay } from "@/hooks/use-search-overlay";
import { ArticleCard, type ArticleCardData } from "@/components/shared/ArticleCard";
import { EmptyState } from "@/components/shared/EmptyState";

interface SearchOverlayProps {
  popularPills: { name: string; slug: string }[];
}

export function SearchOverlay({ popularPills }: SearchOverlayProps) {
  const { isOpen, close } = useSearchOverlay();
  const prefersReducedMotion = useReducedMotion();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ArticleCardData[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const runSearch = (value: string) => {
    if (!value.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setIsLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(value)}`)
      .then((res) => res.json())
      .then((data) => {
        setResults(data.results ?? []);
        setHasSearched(true);
      })
      .finally(() => setIsLoading(false));
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
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
          className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-white"
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
            className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-16 sm:px-6"
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
                className="flex h-10 w-10 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-8">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Type here to search..."
                className="w-full border-b border-border-strong bg-transparent pb-4 text-3xl font-serif text-text-heading placeholder:text-border-strong focus:border-ink focus:outline-none sm:text-5xl"
              />
            </form>

            {popularPills.length > 0 && (
              <div className="mt-8 flex flex-wrap justify-center gap-3">
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
            )}

            {query.trim() && (
              <p className="mt-8 text-center text-sm text-text-muted">
                The word you want to search: <span className="font-semibold text-primary">{query}</span>
              </p>
            )}

            <div className="mt-10">
              {hasSearched && !isLoading && results.length === 0 && (
                <EmptyState
                  icon={SearchX}
                  headline={`No results for "${query}"`}
                  description="Try a different keyword or browse all content instead."
                  cta={{ label: "Browse all content", href: "/content" }}
                />
              )}
              {results.length > 0 && (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {results.map((article) => (
                    <div key={article.slug} onClick={close}>
                      <ArticleCard article={article} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
