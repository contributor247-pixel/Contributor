"use client";

import { useState } from "react";
import { CommentForm } from "@/components/article/CommentForm";
import { CommentList } from "@/components/article/CommentList";
import type { CommentWithAuthor } from "@/lib/actions/comment";

interface CommentSectionProps {
  articleId: string;
  initialComments: CommentWithAuthor[];
}

export function CommentSection({ articleId, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-serif text-xl font-semibold text-text-heading">
        {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
      </h2>
      <CommentForm articleId={articleId} onPosted={(c) => setComments((prev) => [...prev, c])} />
      <CommentList
        comments={comments}
        onDeleted={(id) => setComments((prev) => prev.filter((c) => c.id !== id))}
      />
    </div>
  );
}
