import { z } from "zod";

export const commentSchema = z.object({
  articleId: z.string().uuid(),
  body: z.string().min(1, "Comment cannot be empty").max(2000, "Comment is too long"),
});

export type CommentInput = z.infer<typeof commentSchema>;
