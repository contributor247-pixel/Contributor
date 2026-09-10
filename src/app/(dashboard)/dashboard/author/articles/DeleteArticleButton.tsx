"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteArticleAction } from "@/lib/actions/article";

export function DeleteArticleButton({ articleId, title }: { articleId: string; title: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = () => {
    if (!window.confirm(`Delete "${title}"? This can't be undone from here.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteArticleAction(articleId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <span>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="flex min-h-11 items-center px-2 text-error underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Deleting..." : "Delete"}
      </button>
      {error && <span className="ml-2 text-xs text-error">{error}</span>}
    </span>
  );
}
