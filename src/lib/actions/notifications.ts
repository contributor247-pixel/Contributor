"use server";

import { and, count, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { notifications } from "../../../drizzle/schema/index";
import { requireAuth } from "@/lib/permissions";

export async function getMyNotifications(limit = 10) {
  const session = await requireAuth();
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, session.user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getUnreadNotificationCount(): Promise<number> {
  const session = await requireAuth();
  const [row] = await db
    .select({ value: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, session.user.id), eq(notifications.isRead, false)));
  return row.value;
}

export async function markNotificationReadAction(notificationId: string): Promise<{ success: boolean }> {
  const session = await requireAuth();
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, session.user.id)));
  revalidatePath("/dashboard", "layout");
  return { success: true };
}

export async function markAllNotificationsReadAction(): Promise<{ success: boolean }> {
  const session = await requireAuth();
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.userId, session.user.id), eq(notifications.isRead, false)));
  revalidatePath("/dashboard", "layout");
  return { success: true };
}
