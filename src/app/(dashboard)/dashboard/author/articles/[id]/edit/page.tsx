import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { requireVerifiedAuthorForPage } from "@/lib/require-page-auth";
import { getPublishableCategoriesAction } from "@/lib/actions/categories";
import { db } from "@/lib/db";
import { articles, articleAuthors, articleTags, tags, users } from "../../../../../../../../drizzle/schema/index";
import { ArticleForm } from "@/components/editor/ArticleForm";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireVerifiedAuthorForPage();
  const { id } = await params;

  const [article] = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  if (!article) {
    notFound();
  }

  const authorRows = await db
    .select({ userId: articleAuthors.userId, name: users.name, email: users.email })
    .from(articleAuthors)
    .innerJoin(users, eq(articleAuthors.userId, users.id))
    .where(eq(articleAuthors.articleId, id));

  const isOwnArticle = authorRows.some((row) => row.userId === session!.user.id);
  if (!isOwnArticle) {
    notFound();
  }

  const tagRows = await db
    .select({ name: tags.name })
    .from(articleTags)
    .innerJoin(tags, eq(articleTags.tagId, tags.id))
    .where(eq(articleTags.articleId, id));

  const categories = await getPublishableCategoriesAction();
  const bodyJson = article.body as { html?: string } | null;

  return (
    <ArticleForm
      mode="edit"
      articleId={article.id}
      categories={categories}
      initialValues={{
        title: article.title,
        body: bodyJson?.html ?? "",
        categoryId: article.categoryId,
        tags: tagRows.map((t) => t.name),
        coAuthors: authorRows
          .filter((row) => row.userId !== session!.user.id)
          .map((row) => ({ id: row.userId, name: row.name, email: row.email })),
        coverImageUrl: article.coverImageUrl,
        status: article.status === "published" ? "published" : "draft",
      }}
    />
  );
}
