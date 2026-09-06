"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useAuthModal } from "@/hooks/use-auth-modal";
import { postCommentAction, type CommentWithAuthor } from "@/lib/actions/comment";

interface CommentFormProps {
  articleId: string;
  onPosted: (comment: CommentWithAuthor) => void;
}

export function CommentForm({ articleId, onPosted }: CommentFormProps) {
  const { data: session } = useSession();
  const { open } = useAuthModal();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!session?.user) {
    return (
      <button
        type="button"
        onClick={() => open("login")}
        className="rounded-[4px] border border-border-strong px-4 py-2 text-sm font-medium text-text-body transition-colors hover:bg-bg-muted"
      >
        Log in to leave a comment
      </button>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await postCommentAction({ articleId, body });
      if (!result.success) {
        setError(result.error);
        return;
      }
      onPosted({
        id: result.comment.id,
        body,
        createdAt: result.comment.createdAt,
        userId: session.user.id,
        authorName: session.user.name ?? null,
        authorAvatarUrl: null,
      });
      setBody("");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Leave a comment..."
        rows={3}
        className="w-full rounded-[4px] border border-border-strong px-4 py-3 text-sm text-text-body placeholder:text-text-muted focus:border-ink focus:outline-none focus:ring-[3px] focus:ring-[#11111414]"
      />
      {error && <p className="text-sm text-error">{error}</p>}
      <button
        type="submit"
        disabled={isPending || !body.trim()}
        className="self-start rounded-[4px] bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:bg-[#C9C9C9] disabled:text-[#8A8A8A]"
      >
        {isPending ? "Posting..." : "Post Comment"}
      </button>
    </form>
  );
}
