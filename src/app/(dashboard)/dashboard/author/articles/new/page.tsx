import { requireVerifiedAuthorForPage } from "@/lib/require-page-auth";
import { getPublishableCategoriesAction } from "@/lib/actions/categories";
import { ArticleForm } from "@/components/editor/ArticleForm";

export default async function NewArticlePage() {
  await requireVerifiedAuthorForPage();
  const categories = await getPublishableCategoriesAction();

  return <ArticleForm mode="create" categories={categories} />;
}
