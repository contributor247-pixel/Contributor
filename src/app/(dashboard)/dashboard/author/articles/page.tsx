import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { FileText, PenLine, Plus, Clock, ExternalLink } from "lucide-react";
import { requireVerifiedAuthorForPage } from "@/lib/require-page-auth";
import { db } from "@/lib/db";
import { articles, articleAuthors, categories } from "../../../../../../drizzle/schema/index";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableRefreshButton } from "@/components/shared/TableRefreshButton";
import { DeleteArticleButton } from "./DeleteArticleButton";
import { timeAgo } from "@/lib/time-ago";

export default async function MyArticlesPage() {
  const session = await requireVerifiedAuthorForPage();

  const rows = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      status: articles.status,
      categoryName: categories.name,
      createdAt: articles.createdAt,
    })
    .from(articleAuthors)
    .innerJoin(articles, eq(articleAuthors.articleId, articles.id))
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .where(eq(articleAuthors.userId, session!.user.id))
    .orderBy(desc(articles.createdAt));

  const visibleRows = rows;
  const publishedCount = visibleRows.filter((r) => r.status === "published").length;
  const draftCount = visibleRows.filter((r) => r.status === "draft").length;

  return (
    <div className="space-y-6">
      {/* 1. Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <FileText className="h-3.5 w-3.5" />
            <span>Articles Directory</span>
          </div>
          <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-text-heading">
            My Articles
          </h1>
          <p className="mt-0.5 text-xs text-text-muted">
            Manage your published stories, drafts, and editorial submissions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <TableRefreshButton />
          <Link
            href="/dashboard/author/articles/new"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-primary-hover hover:shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Article</span>
          </Link>
        </div>
      </div>

      {/* 2. Main Articles Table */}
      {visibleRows.length === 0 ? (
        <div className="rounded-2xl border border-border/80 bg-surface p-10 text-center">
          <EmptyState
            icon={FileText}
            headline="You haven't written anything yet"
            description="Start writing your first deep essay or report and reach thousands of curious readers."
            cta={{ label: "Write Your First Article", href: "/dashboard/author/articles/new" }}
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-surface shadow-xs">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border/80 bg-surface-muted/60 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                  <th scope="col" className="px-6 py-4">
                    Article Title
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Created
                  </th>
                  <th scope="col" className="px-6 py-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {visibleRows.map((row) => (
                  <tr
                    key={row.id}
                    className="group transition-colors hover:bg-primary/[0.03]"
                  >
                    {/* Title */}
                    <td className="max-w-xs lg:max-w-sm px-6 py-4">
                      <Link
                        href={`/dashboard/author/articles/${row.id}/edit`}
                        className="font-serif text-sm font-semibold text-text-heading transition-colors group-hover:text-primary block"
                      >
                        {row.title}
                      </Link>
                      {row.status === "published" && (
                        <Link
                          href={`/article/${row.slug}`}
                          target="_blank"
                          className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-text-muted hover:text-primary transition-colors"
                        >
                          <span>View Live Article</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </Link>
                      )}
                    </td>

                    {/* Status */}
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          row.status === "published"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : row.status === "draft"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              : "bg-surface-muted text-text-muted border border-border/60"
                        }`}
                      >
                        {row.status === "published" && (
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        )}
                        <span className="capitalize">{row.status}</span>
                      </span>
                    </td>

                    {/* Category */}
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="rounded-full border border-border/70 bg-surface px-2.5 py-0.5 text-xs text-text-body font-medium">
                        {row.categoryName}
                      </span>
                    </td>

                    {/* Created Date */}
                    <td className="whitespace-nowrap px-6 py-4 text-xs text-text-muted">
                      <div className="flex items-center gap-1 text-text-body font-medium">
                        <Clock className="h-3.5 w-3.5 text-text-muted/70" />
                        <span>
                          {new Intl.DateTimeFormat("en-US", {
                            dateStyle: "medium",
                          }).format(row.createdAt)}
                        </span>
                      </div>
                      <span className="text-[11px] text-text-muted">
                        {timeAgo(row.createdAt)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Link
                          href={`/dashboard/author/articles/${row.id}/edit`}
                          className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-surface px-3 py-1 text-xs font-semibold text-text-heading transition-colors hover:border-primary/40 hover:text-primary shadow-xs"
                        >
                          <PenLine className="h-3 w-3" />
                          <span>Edit</span>
                        </Link>
                        <DeleteArticleButton articleId={row.id} title={row.title} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border/80 bg-surface-muted/30 text-xs text-text-muted">
                  <td colSpan={3} className="px-6 py-3.5 font-medium">
                    Total: <strong>{visibleRows.length}</strong> articles ({publishedCount} published, {draftCount} drafts)
                  </td>
                  <td colSpan={2} className="px-6 py-3.5 text-right font-medium">
                    Contributor Author Studio
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="divide-y divide-border/60 md:hidden">
            {visibleRows.map((row) => (
              <div key={row.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/dashboard/author/articles/${row.id}/edit`}
                    className="font-serif text-sm font-semibold text-text-heading"
                  >
                    {row.title}
                  </Link>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      row.status === "published"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-surface-muted text-text-muted"
                    }`}
                  >
                    {row.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>{row.categoryName}</span>
                  <span>{timeAgo(row.createdAt)}</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Link
                    href={`/dashboard/author/articles/${row.id}/edit`}
                    className="rounded-full border border-border/80 bg-surface px-3 py-1 text-xs font-semibold text-text-heading"
                  >
                    Edit
                  </Link>
                  <DeleteArticleButton articleId={row.id} title={row.title} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
