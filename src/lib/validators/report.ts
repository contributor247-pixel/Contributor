import { z } from "zod";

export const reportSchema = z.object({
  articleId: z.string().uuid(),
  reason: z.enum(["spam", "harassment", "copyright", "misinformation", "other"]),
  detail: z.string().max(1000).optional(),
});

export type ReportInput = z.infer<typeof reportSchema>;
