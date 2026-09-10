interface TableSkeletonProps {
  columns: number;
  rows?: number;
}

// Shared loading skeleton for admin table pages — matches the real
// table's row height/border rhythm so the layout doesn't jump once
// data arrives, per docs/02_ThemeGuideline.md Section 8.4's shared-
// component convention (mirrors EmptyState's role for the empty case).
export function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps) {
  return (
    <div className="overflow-hidden rounded-[4px] border border-border" aria-hidden="true">
      <div className="border-b border-border bg-bg-muted px-4 py-3">
        <div className="h-3 w-16 rounded bg-border-strong/40" />
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex items-center gap-6 border-b border-border px-4 py-3.5 last:border-0"
        >
          {Array.from({ length: columns }).map((__, colIndex) => (
            <div
              key={colIndex}
              className="h-4 flex-1 animate-pulse rounded bg-bg-muted"
              style={{ animationDelay: `${(rowIndex * columns + colIndex) * 40}ms` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
