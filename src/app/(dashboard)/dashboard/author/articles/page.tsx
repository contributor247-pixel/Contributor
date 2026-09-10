import Link from "next/link";
import { eq } from "drizzle-orm";
import { FileText } from "lucide-react";
import { requireVerifiedAuthorForPage } from "@/lib/require-page-auth";
import { db } from "@/lib/db";
import { articles, articleAuthors, categories } from "../../../../../../drizzle/schema/index";
import { EmptyState } from "@/components/shared/EmptyState";
import { DeleteArticleButton } from "./DeleteArticleButton";

export default async function MyArticlesPage() {
  const session = await requireVerifiedAuthorForPage();

  const rows = await db
    .select({
      id: articles.id,
      title: articles.title,
      status: articles.status,
      categoryName: categories.name,
      createdAt: articles.createdAt,
    })
    .from(articleAuthors)
    .innerJoin(articles, eq(articleAuthors.articleId, articles.id))
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .where(eq(articleAuthors.userId, session!.user.id))
    .orderBy(articles.createdAt);

  const visibleRows = rows.filter((r) => r.status !== "unpublished");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold text-text-heading">My Articles</h1>
        <Link
          href="/dashboard/author/articles/new"
          className="inline-flex h-10 items-center rounded-[4px] bg-ink px-4 text-sm font-semibold text-white transition-colors hover:bg-primary"
        >
          New Article
        </Link>
      </div>

      {visibleRows.length === 0 ? (
        <EmptyState
          icon={FileText}
          headline="You haven't published anything yet"
          description="Start writing to see your articles listed here."
          cta={{ label: "Write your first article", href: "/dashboard/author/articles/new" }}
        />
      ) : (
        <div className="overflow-x-auto rounded-[4px] border border-border">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-muted text-left text-xs uppercase tracking-wide text-text-muted">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-text-heading">{row.title}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        row.status === "published"
                          ? "rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success"
                          : "rounded-full bg-bg-muted px-2 py-0.5 text-xs font-medium text-text-muted"
                      }
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-body">{row.categoryName}</td>
                  <td className="px-4 py-3 text-text-muted">
                    {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(row.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end items-center gap-1">
                      <Link
                        href={`/dashboard/author/articles/${row.id}/edit`}
                        className="flex min-h-11 items-center px-2 text-text-body underline-offset-2 hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteArticleButton articleId={row.id} title={row.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
