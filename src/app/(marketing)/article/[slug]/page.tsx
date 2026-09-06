import { notFound } from "next/navigation";
import { getArticleBySlug, getRecentArticles } from "@/lib/queries/articles";
import { getCommentsForArticle } from "@/lib/actions/comment";
import { Avatar } from "@/components/shared/Avatar";
import { CategoryPill } from "@/components/shared/CategoryPill";
import { ArticleCard } from "@/components/shared/ArticleCard";
import { CommentSection } from "@/components/article/CommentSection";
import { ReportDialog } from "@/components/article/ReportDialog";
import { timeAgo } from "@/lib/time-ago";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const [comments, related] = await Promise.all([
    getCommentsForArticle(article.id),
    getRecentArticles(4, article.id),
  ]);

  const bodyHtml = (article.body as { html?: string } | null)?.html ?? "";
  const primaryAuthor = article.authors[0];
  const byline = article.authors.map((a) => a.name ?? "Unknown").join(" & ");

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
        <CategoryPill name={article.categoryName} slug={article.categorySlug} />
      </p>
      <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight text-text-heading sm:text-4xl">
        {article.title}
      </h1>
      <div className="mt-4 flex items-center gap-3">
        <Avatar name={primaryAuthor?.name ?? null} avatarUrl={primaryAuthor?.avatarUrl ?? null} size={40} />
        <div>
          <p className="text-sm font-medium text-text-heading">{byline}</p>
          <p className="text-xs text-text-muted">{timeAgo(article.publishedAt)}</p>
        </div>
      </div>

      {article.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- base64 cover
        <img
          src={article.coverImageUrl}
          alt={article.title}
          className="mt-8 aspect-[16/9] w-full rounded-[4px] object-cover"
        />
      )}

      <div
        className="prose prose-neutral mt-8 max-w-none whitespace-pre-wrap text-text-body"
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />

      <div className="mt-8 border-t border-border pt-4">
        <ReportDialog articleId={article.id} />
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 font-serif text-xl font-semibold text-text-heading">Related Articles</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {related.map((item) => (
              <ArticleCard key={item.slug} article={item} showExcerpt={false} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-16 border-t border-border pt-10">
        <CommentSection articleId={article.id} initialComments={comments} />
      </div>
    </article>
  );
}
