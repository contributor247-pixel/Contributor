import { Tags, Plus } from "lucide-react";
import { requireRoleForPage } from "@/lib/require-page-auth";
import { getAdminCategories } from "@/lib/actions/admin";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableRefreshButton } from "@/components/shared/TableRefreshButton";
import { NewCategoryForm } from "./NewCategoryForm";
import { CategoryRow } from "./CategoryRow";

export default async function AdminCategoriesPage() {
  await requireRoleForPage("admin");
  const categories = await getAdminCategories();

  const activeCount = categories.filter((c) => !c.deprecated).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              TAXONOMY &amp; DISCOVERY
            </span>
            <span className="inline-flex items-center rounded-full bg-surface border border-border/80 px-2.5 py-0.5 text-xs font-medium text-text-muted">
              {activeCount} Active / {categories.length} Total
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-text-heading">
            Category Management
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Configure platform topics, edit category names inline, and retire deprecated tags.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TableRefreshButton />
        </div>
      </div>

      {/* New Category Form */}
      <NewCategoryForm />

      {/* Categories Table Container */}
      {categories.length === 0 ? (
        <div className="rounded-2xl border border-border/80 bg-surface p-12 text-center shadow-xs">
          <EmptyState
            icon={Tags}
            headline="No categories created yet"
            description="Add your first topic category using the form above."
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-border/80 bg-surface shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border/80 bg-bg-alt/50 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  <th className="py-3.5 pl-6 pr-4">Category Name</th>
                  <th className="py-3.5 px-4">URL Slug</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {categories.map((c) => (
                  <CategoryRow
                    key={c.id}
                    id={c.id}
                    name={c.name}
                    slug={c.slug}
                    deprecated={c.deprecated}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Summary Footer */}
          <div className="border-t border-border/80 bg-bg-alt/30 px-6 py-3.5 text-xs text-text-muted flex items-center justify-between">
            <span>
              Total <strong className="text-text-heading">{categories.length}</strong> categories (
              {activeCount} active in publication feed).
            </span>
            <span className="text-[11px] italic">
              Click any category name to edit inline
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
