import { pgTable, uuid, text, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users";
import { articles } from "./articles";

export const purchases = pgTable(
  "purchases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id),
    amountCents: integer("amount_cents").notNull(),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    // Stripe guarantees only at-least-once webhook delivery, so
    // checkout.session.completed can arrive twice for the same payment
    // (confirmed happening in practice under the Stripe CLI's local
    // forwarding). This constraint is the actual guard against a
    // duplicate purchases row (and a duplicate revenue-split ledger
    // entry) for one payment — the webhook handler's own existence
    // check is necessary for its early-return/side-effect logic, but
    // is a check-then-insert race on its own and cannot fully close
    // this by itself.
    stripePaymentIntentIdUnique: uniqueIndex("purchases_stripe_payment_intent_id_unique").on(
      table.stripePaymentIntentId
    ),
  })
);
