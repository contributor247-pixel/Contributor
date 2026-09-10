import Link from "next/link";

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
    <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
      {pages.map((p, i) =>
        p === "ellipsis" ? (
          <span key={`ellipsis-${i}`} className="px-2 text-sm text-text-muted">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(basePath, p)}
            aria-current={p === currentPage ? "page" : undefined}
            className={
              p === currentPage
                ? "flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white"
                : "flex h-11 w-11 items-center justify-center rounded-full text-sm text-text-muted transition-colors hover:bg-bg-muted hover:text-text-body"
            }
          >
            {p}
          </Link>
        )
      )}
      {currentPage < totalPages && (
        <Link
          href={buildHref(basePath, currentPage + 1)}
          className="ml-2 text-sm font-semibold uppercase tracking-wide text-text-body transition-colors hover:text-primary"
        >
          Next
        </Link>
      )}
    </nav>
  );
}
