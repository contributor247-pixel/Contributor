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
      <div className="rounded-2xl border border-border/80 bg-surface p-6 text-center shadow-xs">
        <p className="text-sm font-medium text-text-heading">Join the conversation</p>
        <p className="mt-1 text-xs text-text-muted">Sign in to share your perspective with the author and community.</p>
        <button
          type="button"
          onClick={() => open("login")}
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full border border-primary/40 bg-primary px-5 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-primary-hover hover:border-primary"
        >
          Sign in to leave a comment
        </button>
      </div>
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-surface p-4 sm:p-5 shadow-xs">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Share your thoughts on this dispatch..."
        rows={3}
        className="w-full rounded-xl border border-border/80 bg-bg p-3.5 text-sm text-text-body placeholder:text-text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-y min-h-[90px]"
      />
      {error && <p role="alert" className="text-xs text-error">{error}</p>}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-text-muted">Markdown supported</span>
        <button
          type="submit"
          disabled={isPending || !body.trim()}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Publishing..." : "Post Comment"}
        </button>
      </div>
    </form>
  );
}
