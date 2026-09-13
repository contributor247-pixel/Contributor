import { TableSkeleton } from "@/components/shared/TableSkeleton";

// Mirrors ReaderPurchasesPage's table (Article/Amount/Date).
export default function ReaderPurchasesLoading() {
  return (
    <div>
      <div className="mb-6 h-8 w-32 animate-pulse rounded bg-bg-muted" />
      <TableSkeleton columns={3} />
    </div>
  );
}
