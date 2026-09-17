"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Compass, Sparkles } from "lucide-react";

export interface CategoryPillItem {
  name: string;
  slug: string;
  articleCount?: number;
}

interface TopicExplorerStripProps {
  categories: CategoryPillItem[];
  activeSlug?: string;
}

export function TopicExplorerStrip({ categories, activeSlug }: TopicExplorerStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const offset = direction === "left" ? -280 : 280;
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    setTimeout(checkScroll, 300);
  };

  // Fallback only, used if the real DB-backed category list is ever
  // empty (e.g. a transient fetch failure upstream) — these slugs must
  // match real seeded categories (see drizzle/seed-categories.ts) or
  // every pill 404s on click, per docs/00_ScopeDocument.md Section 4's
  // fixed taxonomy.
  const defaultCategories: CategoryPillItem[] = [
    { name: "Culture", slug: "culture" },
    { name: "Technology", slug: "technology" },
    { name: "Business", slug: "business" },
    { name: "Science", slug: "science" },
    { name: "Lifestyle", slug: "lifestyle" },
    { name: "Travel", slug: "travel" },
    { name: "Food", slug: "food" },
  ];

  const displayList = categories.length > 0 ? categories : defaultCategories;
  const isAllActive = !activeSlug || activeSlug === "all";

  return (
    <div className="sticky top-[72px] z-30 border-b border-t border-border/80 bg-surface/95 shadow-xs backdrop-blur-md transition-all">
      {/* Subtle top amber/oxblood accent line */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/35 to-transparent"
      />

      <div className="mx-auto flex max-w-[1320px] items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
        {/* Label Badge with live ambient pulse */}
        <div className="hidden items-center gap-2.5 border-r border-border/80 pr-4 sm:flex shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
            <Compass className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-heading">
              Explore Topics
            </span>
            <span className="text-[10px] text-text-muted">
              {displayList.length} Curated Channels
            </span>
          </div>
        </div>

        {/* Left Scroll Chevron */}
        <button
          type="button"
          aria-label="Scroll topics left"
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          className="hidden h-11 w-11 items-center justify-center rounded-full border border-border/80 bg-surface text-text-muted transition-all duration-200 hover:border-primary/50 hover:bg-bg-muted hover:text-primary hover:shadow-xs active:scale-95 disabled:pointer-events-none disabled:opacity-20 sm:flex shrink-0 ml-2 mr-1"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Scrollable Container with Luxury Edge Masks */}
        <div className="relative flex-1 overflow-hidden">
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="no-scrollbar flex items-center gap-2 overflow-x-auto px-1 py-1 scroll-smooth"
          >
            {/* "All Dispatches" Master Filter Pill */}
            <Link
              href="/content"
              className={[
                "group relative flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 shadow-xs",
                isAllActive
                  ? "border border-primary bg-gradient-to-r from-primary to-primary-hover text-white shadow-[0_2px_12px_rgba(139,30,63,0.3)] ring-2 ring-primary/20"
                  : "border border-border/80 bg-bg text-text-body hover:border-primary/50 hover:bg-bg-muted hover:text-primary",
              ].join(" ")}
            >
              <Sparkles
                className={[
                  "h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-115 group-hover:rotate-12",
                  isAllActive ? "text-supportive-subtle" : "text-supportive",
                ].join(" ")}
                aria-hidden="true"
              />
              <span>All Dispatches</span>
            </Link>

            {/* Individual Topic Filter Pills */}
            {displayList.map((cat) => {
              const isActive = activeSlug === cat.slug;
              return (
                <Link
                  key={cat.slug}
                  href={`/content/${cat.slug}`}
                  className={[
                    "group flex min-h-11 shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 shadow-xs",
                    isActive
                      ? "border border-primary bg-gradient-to-r from-primary to-primary-hover font-semibold text-white shadow-[0_2px_12px_rgba(139,30,63,0.3)] ring-2 ring-primary/20"
                      : "border border-border/80 bg-bg text-text-body hover:border-primary/50 hover:bg-bg-muted hover:text-primary hover:shadow-sm",
                  ].join(" ")}
                >
                  <span className="truncate">{cat.name}</span>
                  {typeof cat.articleCount === "number" && cat.articleCount > 0 && (
                    <span
                      className={[
                        "rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold transition-colors",
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-bg-muted text-text-muted group-hover:bg-primary/15 group-hover:text-primary",
                      ].join(" ")}
                    >
                      {cat.articleCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Scroll Chevron */}
        <button
          type="button"
          aria-label="Scroll topics right"
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          className="hidden h-11 w-11 items-center justify-center rounded-full border border-border/80 bg-surface text-text-muted transition-all duration-200 hover:border-primary/50 hover:bg-bg-muted hover:text-primary hover:shadow-xs active:scale-95 disabled:pointer-events-none disabled:opacity-20 sm:flex shrink-0 ml-1"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

