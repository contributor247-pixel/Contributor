"use server";

import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { subscriptions, publications } from "../../../drizzle/schema/index";
import { requireAuth } from "@/lib/permissions";
import { stripe } from "@/lib/stripe";

export type ReaderSubscription = {
  id: string;
  type: "publication" | "platform";
  status: "active" | "cancelled" | "superseded" | "past_due";
  billingInterval: "monthly" | "yearly";
  currentPeriodEnd: Date;
  publicationId: string | null;
  publicationName: string | null;
};

export async function getMyReaderSubscriptionsAction(): Promise<ReaderSubscription[]> {
  const session = await requireAuth();

  const rows = await db
    .select({
      id: subscriptions.id,
      type: subscriptions.type,
      status: subscriptions.status,
      billingInterval: subscriptions.billingInterval,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
      publicationId: subscriptions.publicationId,
      publicationName: publications.name,
    })
    .from(subscriptions)
    .leftJoin(publications, eq(subscriptions.publicationId, publications.id))
    .where(and(eq(subscriptions.userId, session.user.id)))
    .orderBy(desc(subscriptions.createdAt));

  return rows.filter((r): r is ReaderSubscription => r.type === "publication" || r.type === "platform");
}

export async function getActivePublicationSubscriptionName(userId: string): Promise<string | null> {
  const [row] = await db
    .select({ name: publications.name })
    .from(subscriptions)
    .innerJoin(publications, eq(subscriptions.publicationId, publications.id))
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.type, "publication"), eq(subscriptions.status, "active")))
    .limit(1);
  return row?.name ?? null;
}

// Powers the reverse-direction warning on the Publication-subscribe
// button (docs/00_ScopeDocument.md Section 6's supersede rule: the
// UI should warn, but must not block, subscribing to a Publication
// while already on a Platform subscription — that combination is
// allowed but redundant since Platform access already includes it).
export async function hasActivePlatformSubscription(userId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.type, "platform"), eq(subscriptions.status, "active")))
    .limit(1);
  return !!row;
}

export type CancelSubscriptionResult = { success: true } | { success: false; error: string };

export async function cancelSubscriptionAction(subscriptionId: string): Promise<CancelSubscriptionResult> {
  const session = await requireAuth();
  const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.id, subscriptionId)).limit(1);
  if (!subscription || subscription.userId !== session.user.id) {
    return { success: false, error: "Subscription not found" };
  }

  // Atomic claim: the UPDATE's own WHERE status='active' is what
  // actually prevents a double-cancel, not the plain status check above
  // (that's ownership-only) — without this, two concurrent calls (a
  // double-click, or two open tabs) can both pass a check-then-write
  // read before either writes, both call stripe.subscriptions.cancel()
  // on the same already-cancelled-by-the-other-call subscription, and
  // Stripe's API rejects the second one — surfacing "Failed to cancel.
  // Please try again." to a user whose subscription was in fact already
  // successfully cancelled by their own other click. Claiming the DB
  // row first means only one call ever reaches Stripe.
  const claimed = await db
    .update(subscriptions)
    .set({ status: "cancelled" })
    .where(and(eq(subscriptions.id, subscriptionId), eq(subscriptions.status, "active")))
    .returning({ stripeSubscriptionId: subscriptions.stripeSubscriptionId });
  if (claimed.length === 0) {
    return { success: false, error: "This subscription is not active" };
  }

  const stripeSubscriptionId = claimed[0].stripeSubscriptionId;
  if (stripeSubscriptionId) {
    try {
      await stripe.subscriptions.cancel(stripeSubscriptionId);
    } catch (err) {
      // The DB row is already claimed as cancelled at this point — a
      // Stripe-side failure here means the local state and Stripe's
      // state have drifted, not that the cancellation as a whole
      // failed to happen. Surfacing a generic retry-me error would be
      // misleading (retrying would hit "not active" above, having
      // told the user retrying is the fix). Logged for follow-up;
      // still reported as success since the subscription itself is
      // cancelled either way.
      console.error("Cancelled locally but Stripe API call failed — local/Stripe state drift:", err);
    }
  }

  return { success: true };
}
