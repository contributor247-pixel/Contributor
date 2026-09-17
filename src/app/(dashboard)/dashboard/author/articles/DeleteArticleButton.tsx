"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteArticleAction } from "@/lib/actions/article";
import { useConfirm } from "@/hooks/use-confirm";
import { useToast } from "@/hooks/use-toast";

export function DeleteArticleButton({ articleId, title }: { articleId: string; title: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const confirm = useConfirm();
  const { show } = useToast();

  const handleDelete = async () => {
    // deleteArticleAction soft-deletes (sets status: "unpublished"),
    // the same status a moderator's unpublish action uses — the row
    // stays in this list, just relabeled, not removed. The dialog and
    // toast copy must say that plainly: "will be removed" / "was
    // deleted" previously promised something that didn't happen,
    // which read as the delete silently failing.
    const confirmed = await confirm({
      title: "Unpublish this article?",
      message: `"${title}" will be taken down from public view and marked Unpublished here. This can't be undone from here.`,
      confirmLabel: "Unpublish",
    });
    if (!confirmed) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteArticleAction(articleId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      show(`"${title}" was unpublished.`);
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
        {isPending ? "Unpublishing..." : "Unpublish"}
      </button>
      {error && <span role="alert" className="ml-2 text-xs text-error">{error}</span>}
    </span>
  );
}
