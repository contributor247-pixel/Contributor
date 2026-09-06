import { z } from "zod";

export const articleSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  body: z.string().min(1, "Body is required"),
  categoryId: z.string().uuid("Select a category"),
  tags: z.array(z.string().min(1).max(40)).max(20, "Too many tags"),
  coAuthorIds: z.array(z.string().uuid()).max(5, "Too many co-authors"),
  coverImageUrl: z.string().optional().nullable(),
  status: z.enum(["draft", "published"]),
});

export type ArticleInput = z.infer<typeof articleSchema>;
