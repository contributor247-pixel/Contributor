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
  if (subscription.status !== "active") {
    return { success: false, error: "This subscription is not active" };
  }

  if (subscription.stripeSubscriptionId) {
    try {
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    } catch (err) {
      console.error("Failed to cancel subscription in Stripe:", err);
      return { success: false, error: "Failed to cancel subscription. Please try again." };
    }
  }

  await db.update(subscriptions).set({ status: "cancelled" }).where(eq(subscriptions.id, subscriptionId));
  return { success: true };
}
