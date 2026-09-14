import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(100),
  email: z.string().trim().email("Enter a valid email address."),
  subject: z.string().trim().min(1, "Enter a subject.").max(150),
  message: z.string().trim().min(10, "Message must be at least 10 characters.").max(4000),
});

export type ContactInput = z.infer<typeof contactSchema>;
