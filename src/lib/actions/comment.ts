"use server";

import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { comments, users } from "../../../drizzle/schema/index";
import { requireAuth, SuspendedError } from "@/lib/permissions";
import { commentSchema, type CommentInput } from "@/lib/validators/comment";

export type CommentActionResult = { success: true } | { success: false; error: string };

export type PostCommentResult =
  | { success: true; comment: { id: string; createdAt: Date } }
  | { success: false; error: string };

export async function postCommentAction(input: CommentInput): Promise<PostCommentResult> {
  let session;
  try {
    session = await requireAuth();
  } catch (err) {
    // requireAuth throwing here isn't the "not logged in" case — the
    // client already gates that (CommentForm shows a sign-in prompt
    // instead of the form when there's no session). It's a session
    // that was valid when the page loaded but the account has since
    // been suspended — letting this throw uncaught surfaces the
    // generic "Something went wrong" error boundary instead of a
    // message that tells the user what actually happened.
    if (err instanceof SuspendedError) {
      return { success: false, error: "Your account has been suspended." };
    }
    throw err;
  }
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
  let session;
  try {
    session = await requireAuth();
  } catch (err) {
    if (err instanceof SuspendedError) {
      return { success: false, error: "Your account has been suspended." };
    }
    throw err;
  }
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

// Previously fetched every comment ever posted on the article with no
// limit, on every single article-page load — fine for a new article,
// unbounded over its real lifetime as comments accumulate. Capped to
// the most recent N (oldest-first display order is preserved by
// re-sorting after the DB gives back the newest rows); a real
// "load more"/paginated thread is the proper fix if articles
// routinely exceed this.
const COMMENTS_LIMIT = 200;

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
    .orderBy(desc(comments.createdAt))
    .limit(COMMENTS_LIMIT);
  return rows.reverse();
}
