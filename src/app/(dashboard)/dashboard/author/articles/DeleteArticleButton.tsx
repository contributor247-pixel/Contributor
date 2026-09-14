"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteArticleAction } from "@/lib/actions/article";
import { useConfirm } from "@/hooks/use-confirm";

export function DeleteArticleButton({ articleId, title }: { articleId: string; title: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const confirm = useConfirm();

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Delete this article?",
      message: `"${title}" will be removed. This can't be undone from here.`,
      confirmLabel: "Delete",
    });
    if (!confirmed) return;
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
      {error && <span role="alert" className="ml-2 text-xs text-error">{error}</span>}
    </span>
  );
}
