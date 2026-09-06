import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { platformConfig, subscriptions } from "../../../drizzle/schema/index";

export async function getAuthorProSubscription(userId: string) {
  const [row] = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.type, "author_pro")))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);
  return row ?? null;
}

export async function getPlatformConfig() {
  const [config] = await db.select().from(platformConfig).limit(1);
  return config ?? null;
}
