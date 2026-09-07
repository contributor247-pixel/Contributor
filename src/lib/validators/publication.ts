import { z } from "zod";

export const publicationSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().max(2000).optional().nullable(),
  coverImageUrl: z.string().optional().nullable(),
});

export type PublicationInput = z.infer<typeof publicationSchema>;
