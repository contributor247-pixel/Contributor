import { TableSkeleton } from "@/components/shared/TableSkeleton";

// Mirrors MyArticlesPage's table (Title/Status/Category/Created/Actions).
export default function MyArticlesLoading() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-40 animate-pulse rounded bg-bg-muted" />
        <div className="h-10 w-32 animate-pulse rounded-[4px] bg-bg-muted" />
      </div>
      <TableSkeleton columns={5} />
    </div>
  );
}
