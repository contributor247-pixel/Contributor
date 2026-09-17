import Link from "next/link";
import { Users as UsersIcon, Shield, PenTool, BookOpen, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { requireRoleForPage } from "@/lib/require-page-auth";
import { getAdminUsers } from "@/lib/actions/admin";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableRefreshButton } from "@/components/shared/TableRefreshButton";
import { UserRowActions } from "./UserRowActions";
import { SearchBar } from "./SearchBar";

const PER_PAGE = 20;

// docs/00_ScopeDocument.md Section 8 lists user management as covering
// "Readers and Authors (including AuthorPro)" — AuthorPro isn't a
// users.role value (it's a live subscription, see permissions.ts's
// requireAuthorPro), so it needs its own badge alongside the role
// badge rather than being folded into the Author case.
function getRoleBadge(role: string, isAuthorPro: boolean) {
  switch (role) {
    case "admin":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
          <Shield className="h-3 w-3" />
          Admin
        </span>
      );
    case "author":
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
            <PenTool className="h-3 w-3" />
            Author
          </span>
          {isAuthorPro && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3 w-3" />
              AuthorPro
            </span>
          )}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-bg-alt border border-border/80 px-2.5 py-0.5 text-xs font-medium text-text-muted">
          <BookOpen className="h-3 w-3" />
          Reader
        </span>
      );
  }
}

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
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              USER DIRECTORY
            </span>
            <span className="inline-flex items-center rounded-full bg-surface border border-border/80 px-2.5 py-0.5 text-xs font-medium text-text-muted">
              {totalCount} Total Accounts
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-text-heading">
            User Management
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Manage account verification, access roles, and platform permissions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SearchBar initialQuery={search} />
          <TableRefreshButton />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-border/80 bg-surface p-12 text-center shadow-xs">
          <EmptyState
            icon={UsersIcon}
            headline={search ? `No accounts match "${search}"` : "No registered users found"}
            description={
              search
                ? "Check for typos or try searching with a partial email address or name."
                : "New user registrations will populate here automatically."
            }
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-border/80 bg-surface shadow-xs overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border/80 bg-bg-alt/50 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  <th className="py-3.5 pl-6 pr-4">User</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Verified</th>
                  <th className="py-3.5 px-4">Joined</th>
                  <th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {items.map((row) => {
                  const initial = (row.name || row.email || "U")[0].toUpperCase();
                  const isSuspended = row.status === "suspended";

                  return (
                    <tr
                      key={row.id}
                      className="group transition-colors hover:bg-bg-alt/40"
                    >
                      {/* Name & Avatar */}
                      <td className="py-4 pl-6 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-bg-alt to-border/80 font-serif text-sm font-semibold text-text-heading border border-border/60">
                            {initial}
                          </div>
                          <div>
                            <span className="font-medium text-text-heading">
                              {row.name || "Unnamed User"}
                            </span>
                            <div className="text-[11px] text-text-muted font-mono truncate max-w-[120px]">
                              {row.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-4 text-text-body font-mono text-xs">
                        {row.email}
                      </td>

                      {/* Role */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {getRoleBadge(row.role, row.isAuthorPro)}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            isSuspended
                              ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isSuspended ? "bg-red-500" : "bg-emerald-500 animate-pulse"
                            }`}
                          />
                          {isSuspended ? "Suspended" : "Active"}
                        </span>
                      </td>

                      {/* Verified */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {row.emailVerified ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-text-muted">
                            <XCircle className="h-3.5 w-3.5 text-text-muted/60" />
                            Unverified
                          </span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs text-text-muted">
                        {new Intl.DateTimeFormat("en-US", {
                          dateStyle: "medium",
                        }).format(row.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 pl-4 pr-6 text-right whitespace-nowrap">
                        <UserRowActions
                          userId={row.id}
                          role={row.role}
                          status={row.status}
                          emailVerified={!!row.emailVerified}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden divide-y divide-border/60">
            {items.map((row) => {
              const initial = (row.name || row.email || "U")[0].toUpperCase();
              const isSuspended = row.status === "suspended";

              return (
                <div key={row.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bg-alt font-serif text-sm font-semibold text-text-heading border border-border/80">
                        {initial}
                      </div>
                      <div>
                        <div className="font-medium text-text-heading text-sm">
                          {row.name || "Unnamed User"}
                        </div>
                        <div className="text-xs text-text-muted font-mono">{row.email}</div>
                      </div>
                    </div>
                    {getRoleBadge(row.role, row.isAuthorPro)}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1 border-t border-border/40">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          isSuspended
                            ? "bg-red-500/10 text-red-600"
                            : "bg-emerald-500/10 text-emerald-600"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isSuspended ? "bg-red-500" : "bg-emerald-500"
                          }`}
                        />
                        {isSuspended ? "Suspended" : "Active"}
                      </span>
                      <span className="text-text-muted">
                        Joined {new Intl.DateTimeFormat("en-US", { dateStyle: "short" }).format(row.createdAt)}
                      </span>
                    </div>

                    <UserRowActions
                      userId={row.id}
                      role={row.role}
                      status={row.status}
                      emailVerified={!!row.emailVerified}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/80 bg-bg-alt/30 px-6 py-4 text-xs text-text-muted">
              <span>
                Showing page <strong className="text-text-heading">{page}</strong> of{" "}
                <strong className="text-text-heading">{totalPages}</strong> (
                {totalCount.toLocaleString()} registered users)
              </span>

              <div className="flex items-center gap-2">
                {page > 1 ? (
                  <Link
                    href={`?page=${page - 1}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-surface px-3.5 py-1.5 text-xs font-semibold text-text-heading shadow-2xs hover:bg-bg-alt hover:border-border-strong transition-all"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Previous
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-surface/50 px-3.5 py-1.5 text-xs font-medium text-text-muted/50 cursor-not-allowed">
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Previous
                  </span>
                )}

                {page < totalPages ? (
                  <Link
                    href={`?page=${page + 1}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-surface px-3.5 py-1.5 text-xs font-semibold text-text-heading shadow-2xs hover:bg-bg-alt hover:border-border-strong transition-all"
                  >
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-surface/50 px-3.5 py-1.5 text-xs font-medium text-text-muted/50 cursor-not-allowed">
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
