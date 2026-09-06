import { z } from "zod";

export const subscriptionCheckoutSchema = z.object({
  interval: z.enum(["monthly", "yearly"]),
});

export type SubscriptionCheckoutInput = z.infer<typeof subscriptionCheckoutSchema>;
