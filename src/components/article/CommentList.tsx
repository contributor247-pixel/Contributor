"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/shared/Avatar";
import { timeAgo } from "@/lib/time-ago";
import { deleteCommentAction, type CommentWithAuthor } from "@/lib/actions/comment";

interface CommentListProps {
  comments: CommentWithAuthor[];
  onDeleted: (commentId: string) => void;
}

export function CommentList({ comments, onDeleted }: CommentListProps) {
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const handleDelete = (commentId: string) => {
    if (!window.confirm("Delete this comment? This can't be undone.")) return;
    setPendingId(commentId);
    startTransition(async () => {
      const result = await deleteCommentAction(commentId);
      if (result.success) {
        onDeleted(commentId);
      }
      setPendingId(null);
    });
  };

  if (comments.length === 0) {
    return <p className="text-sm text-text-muted">Be the first to comment.</p>;
  }

  return (
    <ul className="flex flex-col gap-6">
      {comments.map((comment) => {
        const canDelete = session?.user?.id === comment.userId || session?.user?.role === "admin";
        return (
          <li key={comment.id} className="flex gap-3">
            <Avatar name={comment.authorName} avatarUrl={comment.authorAvatarUrl} size={36} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-text-heading">
                  {comment.authorName ?? "Unknown"}
                </span>
                <span className="text-xs text-text-muted">{timeAgo(comment.createdAt)}</span>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-text-body">{comment.body}</p>
              {canDelete && (
                <button
                  type="button"
                  onClick={() => handleDelete(comment.id)}
                  disabled={isPending && pendingId === comment.id}
                  className="mt-1 text-xs text-text-muted underline-offset-2 hover:text-error hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending && pendingId === comment.id ? "Deleting..." : "Delete"}
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
