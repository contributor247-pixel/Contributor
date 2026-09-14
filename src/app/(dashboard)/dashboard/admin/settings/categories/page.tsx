import { Tags } from "lucide-react";
import { requireRoleForPage } from "@/lib/require-page-auth";
import { getAdminCategories } from "@/lib/actions/admin";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableRefreshButton } from "@/components/shared/TableRefreshButton";
import { NewCategoryForm } from "./NewCategoryForm";
import { CategoryRow } from "./CategoryRow";

export default async function AdminCategoriesPage() {
  await requireRoleForPage("admin");
  const categories = await getAdminCategories();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-2xl font-semibold text-text-heading">Categories</h1>
        <TableRefreshButton />
      </div>

      <NewCategoryForm />

      {categories.length === 0 ? (
        <EmptyState icon={Tags} headline="No categories yet" description="Add your first category above." />
      ) : (
        <div className="overflow-x-auto rounded-[4px] border border-border">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-muted text-left text-xs uppercase tracking-wide text-text-muted">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <CategoryRow key={c.id} id={c.id} name={c.name} slug={c.slug} deprecated={c.deprecated} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
