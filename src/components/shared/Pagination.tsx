import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

function buildHref(basePath: string, page: number): string {
  if (page <= 1) return basePath;
  const separator = basePath.includes("?") ? "&" : "?";
  return `${basePath}${separator}page=${page}`;
}

function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, 2, total - 1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const result: (number | "ellipsis")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push("ellipsis");
    result.push(p);
    prev = p;
  }
  return result;
}

export function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav className="mt-14 flex flex-wrap items-center justify-center gap-2" aria-label="Catalog pagination">
      {/* Previous Page Button */}
      {currentPage > 1 ? (
        <Link
          href={buildHref(basePath, currentPage - 1)}
          className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border/80 bg-surface px-4 text-xs font-semibold text-text-body shadow-xs transition-all hover:border-primary/50 hover:bg-bg-muted hover:text-primary"
          aria-label="Go to previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </Link>
      ) : (
        <span className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border/40 bg-surface/40 px-4 text-xs font-semibold text-text-muted/40 cursor-not-allowed">
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </span>
      )}

      {/* Page Number Pills */}
      <div className="flex items-center gap-1.5 mx-1">
        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <span key={`ellipsis-${i}`} className="px-2 text-sm text-text-muted select-none">
              &hellip;
            </span>
          ) : (
            <Link
              key={p}
              href={buildHref(basePath, p)}
              aria-current={p === currentPage ? "page" : undefined}
              className={
                p === currentPage
                  ? "flex h-10 w-10 items-center justify-center rounded-full border border-primary bg-gradient-to-r from-primary to-primary-hover text-xs font-bold text-white shadow-sm ring-2 ring-primary/20"
                  : "flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-surface text-xs font-medium text-text-body transition-all hover:border-primary/40 hover:bg-bg-muted hover:text-primary hover:shadow-xs"
              }
            >
              {p}
            </Link>
          )
        )}
      </div>

      {/* Next Page Button */}
      {currentPage < totalPages ? (
        <Link
          href={buildHref(basePath, currentPage + 1)}
          className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border/80 bg-surface px-4 text-xs font-semibold text-text-body shadow-xs transition-all hover:border-primary/50 hover:bg-bg-muted hover:text-primary"
          aria-label="Go to next page"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border/40 bg-surface/40 px-4 text-xs font-semibold text-text-muted/40 cursor-not-allowed">
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
