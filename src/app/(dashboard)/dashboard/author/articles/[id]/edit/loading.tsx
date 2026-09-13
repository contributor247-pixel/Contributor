// Same shape as .../articles/new/loading.tsx — EditArticlePage renders
// the same ArticleForm once its article/author/tag lookups resolve.
export default function EditArticleLoading() {
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
