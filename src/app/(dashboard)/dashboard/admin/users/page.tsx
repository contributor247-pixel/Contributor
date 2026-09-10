import { Users as UsersIcon } from "lucide-react";
import { requireRoleForPage } from "@/lib/require-page-auth";
import { getAdminUsers } from "@/lib/actions/admin";
import { EmptyState } from "@/components/shared/EmptyState";
import { UserRowActions } from "./UserRowActions";
import { SearchBar } from "./SearchBar";

const PER_PAGE = 20;

const ROLE_BADGE: Record<string, string> = {
  admin: "bg-primary-subtle text-primary",
  author: "bg-bg-muted text-text-body",
  reader: "bg-bg-muted text-text-muted",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  await requireRoleForPage("admin");
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const search = params.q ?? "";

  const { items, totalCount } = await getAdminUsers(page, PER_PAGE, search);
  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-2xl font-semibold text-text-heading">Users</h1>
        <SearchBar initialQuery={search} />
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          headline={search ? "No users match your search" : "No users yet"}
          description={search ? "Try a different name or email." : "Users will appear here as they sign up."}
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-[4px] border border-border">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-bg-muted text-left text-xs uppercase tracking-wide text-text-muted">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Verified</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr key={row.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-text-heading">{row.name ?? "Unnamed"}</td>
                    <td className="px-4 py-3 text-text-body">{row.email}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${ROLE_BADGE[row.role]}`}>
                        {row.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          row.status === "active"
                            ? "rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success"
                            : "rounded-full bg-error/10 px-2 py-0.5 text-xs font-medium text-error"
                        }
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-muted">{row.emailVerified ? "Yes" : "No"}</td>
                    <td className="px-4 py-3 text-text-muted">
                      {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(row.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <UserRowActions
                        userId={row.id}
                        role={row.role}
                        status={row.status}
                        emailVerified={!!row.emailVerified}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-text-muted">
              <span>
                Page {page} of {totalPages} ({totalCount} users)
              </span>
              <div className="flex gap-2">
                {page > 1 && (
                  <a
                    href={`?page=${page - 1}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
                    className="rounded-[4px] border border-border-strong px-3 py-1.5 text-text-body hover:bg-bg-muted"
                  >
                    Previous
                  </a>
                )}
                {page < totalPages && (
                  <a
                    href={`?page=${page + 1}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
                    className="rounded-[4px] border border-border-strong px-3 py-1.5 text-text-body hover:bg-bg-muted"
                  >
                    Next
                  </a>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
