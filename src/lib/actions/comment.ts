"use server";

import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { comments, users } from "../../../drizzle/schema/index";
import { requireAuth } from "@/lib/permissions";
import { commentSchema, type CommentInput } from "@/lib/validators/comment";

export type CommentActionResult = { success: true } | { success: false; error: string };

export type PostCommentResult =
  | { success: true; comment: { id: string; createdAt: Date } }
  | { success: false; error: string };

export async function postCommentAction(input: CommentInput): Promise<PostCommentResult> {
  const session = await requireAuth();
  const parsed = commentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid comment" };
  }
  const [created] = await db
    .insert(comments)
    .values({
      articleId: parsed.data.articleId,
      userId: session.user.id,
      body: parsed.data.body,
    })
    .returning({ id: comments.id, createdAt: comments.createdAt });
  return { success: true, comment: created };
}

export async function deleteCommentAction(commentId: string): Promise<CommentActionResult> {
  const session = await requireAuth();
  const [existing] = await db.select().from(comments).where(eq(comments.id, commentId)).limit(1);
  if (!existing || existing.deletedAt) {
    return { success: false, error: "Comment not found" };
  }
  const isOwnComment = existing.userId === session.user.id;
  const isAdmin = session.user.role === "admin";
  if (!isOwnComment && !isAdmin) {
    return { success: false, error: "You do not have permission to delete this comment" };
  }
  await db.update(comments).set({ deletedAt: new Date() }).where(eq(comments.id, commentId));
  return { success: true };
}

export type CommentWithAuthor = {
  id: string;
  body: string;
  createdAt: Date;
  userId: string;
  authorName: string | null;
  authorAvatarUrl: string | null;
};

export async function getCommentsForArticle(articleId: string): Promise<CommentWithAuthor[]> {
  const rows = await db
    .select({
      id: comments.id,
      body: comments.body,
      createdAt: comments.createdAt,
      userId: comments.userId,
      authorName: users.name,
      authorAvatarUrl: users.avatarUrl,
    })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(and(eq(comments.articleId, articleId), isNull(comments.deletedAt)))
    .orderBy(asc(comments.createdAt));
  return rows;
}
