import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Stripe only guarantees at-least-once webhook delivery — the same
// event id can arrive more than once (a retry after a slow response,
// a duplicate from Stripe's own infrastructure, or a manual resend).
// checkout.session.completed already guards its own side effects via
// unique constraints on the rows it inserts (purchases.stripePaymentIntentId,
// subscriptions.stripeSubscriptionId), but invoice.payment_succeeded's
// pooled-revenue distribution can legitimately insert MORE THAN ONE
// ledger row per delivery (one per distinct article read that period),
// so there's no single row-level unique constraint to hang idempotency
// on there. This table is a general per-event-id guard usable by any
// webhook branch: claim the event id via onConflictDoNothing before
// doing side-effecting work, and skip if the claim didn't land.
export const processedWebhookEvents = pgTable("processed_webhook_events", {
  stripeEventId: text("stripe_event_id").primaryKey(),
  processedAt: timestamp("processed_at", { mode: "date" }).notNull().defaultNow(),
});
