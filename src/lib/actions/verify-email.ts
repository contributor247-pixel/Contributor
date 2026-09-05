"use server";

import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, verificationTokens } from "../../../drizzle/schema/index";
import { sendVerificationEmail } from "@/lib/email";

export type VerifyEmailResult =
  | { success: true }
  | { success: false; error: "invalid" | "expired" };

export async function verifyEmailAction(token: string): Promise<VerifyEmailResult> {
  const [record] = await db
    .select()
    .from(verificationTokens)
    .where(eq(verificationTokens.token, token))
    .limit(1);

  if (!record) {
    return { success: false, error: "invalid" };
  }

  // Always consume the token on first use, even if expired, so a leaked
  // expired link can't be retried indefinitely.
  await db
    .delete(verificationTokens)
    .where(
      and(
        eq(verificationTokens.identifier, record.identifier),
        eq(verificationTokens.token, record.token)
      )
    );

  if (record.expires < new Date()) {
    return { success: false, error: "expired" };
  }

  await db
    .update(users)
    .set({ emailVerified: new Date() })
    .where(eq(users.email, record.identifier));

  return { success: true };
}

export type ResendVerificationResult =
  | { success: true }
  | { success: false; error: string };

export async function resendVerificationAction(email: string): Promise<ResendVerificationResult> {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) {
    // Don't reveal whether the account exists.
    return { success: true };
  }
  if (user.emailVerified) {
    return { success: false, error: "This account is already verified." };
  }

  try {
    await sendVerificationEmail(user);
  } catch {
    return { success: false, error: "Couldn't send the email right now. Please try again shortly." };
  }
  return { success: true };
}
