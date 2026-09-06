import { requireAuthForPage } from "@/lib/require-page-auth";
import { DashboardShell } from "./DashboardShell";

// Any authenticated user may enter the dashboard shell — per-role
// route protection (requireRole/requireVerifiedAuthor/requireAuthorPro
// from Step 2.6) is applied by each individual route under
// author/**, reader/**, and admin/** once those pages exist.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireAuthForPage();
  return <DashboardShell>{children}</DashboardShell>;
}
