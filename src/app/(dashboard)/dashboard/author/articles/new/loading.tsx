// Mirrors ArticleForm's rough shape (title, meta row, body) while
// getPublishableCategoriesAction() resolves.
export default function NewArticleLoading() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="h-11 w-full animate-pulse rounded-[4px] bg-bg-muted" />
      <div className="flex gap-3">
        <div className="h-10 w-40 animate-pulse rounded-[4px] bg-bg-muted" />
        <div className="h-10 w-40 animate-pulse rounded-[4px] bg-bg-muted" />
      </div>
      <div className="h-64 w-full animate-pulse rounded-[4px] bg-bg-muted" />
    </div>
  );
}
