import { TableSkeleton } from "@/components/shared/TableSkeleton";

export default function AdminCategoriesLoading() {
  return (
    <div>
      <div className="mb-6 h-8 w-32 animate-pulse rounded bg-bg-muted" />
      <div className="mb-6 flex items-start gap-3">
        <div className="h-11 w-64 animate-pulse rounded-[4px] bg-bg-muted" />
        <div className="h-11 w-36 animate-pulse rounded-[4px] bg-bg-muted" />
      </div>
      <TableSkeleton columns={4} rows={7} />
    </div>
  );
}
