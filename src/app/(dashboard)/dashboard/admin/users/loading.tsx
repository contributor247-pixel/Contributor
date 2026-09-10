import { TableSkeleton } from "@/components/shared/TableSkeleton";

export default function AdminUsersLoading() {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="h-8 w-32 animate-pulse rounded bg-bg-muted" />
        <div className="h-10 w-full max-w-xs animate-pulse rounded-[4px] bg-bg-muted" />
      </div>
      <TableSkeleton columns={7} />
    </div>
  );
}
