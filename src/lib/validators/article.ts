import { z } from "zod";

// body is Tiptap-generated HTML — an "empty" editor still serializes to
// markup like "<p></p>", which a plain .min(1) string check would pass
// even though there's no real content, so strip tags before checking.
function hasVisibleText(html: string): boolean {
  return html.replace(/<[^>]*>/g, "").trim().length > 0;
}

export const articleSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  body: z.string().refine(hasVisibleText, "Body is required"),
  categoryId: z.string().uuid("Select a category"),
  tags: z.array(z.string().min(1).max(40)).max(20, "Too many tags"),
  coAuthorIds: z.array(z.string().uuid()).max(5, "Too many co-authors"),
  coverImageUrl: z.string().optional().nullable(),
  status: z.enum(["draft", "published"]),
  isPremium: z.boolean(),
  priceCents: z.number().int().positive().optional().nullable(),
  publicationId: z.string().uuid().optional().nullable(),
});

export type ArticleInput = z.infer<typeof articleSchema>;
