import { z } from "zod";

export const subscriptionCheckoutSchema = z.object({
  interval: z.enum(["monthly", "yearly"]),
  type: z.enum(["author_pro", "publication", "platform"]).default("author_pro"),
  publicationId: z.string().uuid().optional(),
});

export type SubscriptionCheckoutInput = z.infer<typeof subscriptionCheckoutSchema>;
