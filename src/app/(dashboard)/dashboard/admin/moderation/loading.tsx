import { TableSkeleton } from "@/components/shared/TableSkeleton";

export default function ModerationQueueLoading() {
  return (
    <div>
      <div className="mb-6 h-8 w-56 animate-pulse rounded bg-bg-muted" />
      <TableSkeleton columns={5} />
    </div>
  );
}
