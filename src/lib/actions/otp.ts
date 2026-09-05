"use server";

import { auth } from "@/lib/auth";
import { generateOtp, verifyOtp } from "@/lib/otp";
import { db } from "@/lib/db";
import { otpCodes } from "../../../drizzle/schema/index";
import { eq, desc } from "drizzle-orm";

export type SubmitOtpResult =
  | { success: true }
  | { success: false; error: string };

export async function submitOtpAction(code: string): Promise<SubmitOtpResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }

  const result = await verifyOtp(session.user.id, code);
  if (result === "invalid") {
    return { success: false, error: "That code is incorrect. Please try again." };
  }
  if (result === "expired") {
    return { success: false, error: "That code has expired. Request a new one below." };
  }

  return { success: true };
}

const RESEND_COOLDOWN_MS = 60 * 1000;

export type ResendOtpResult =
  | { success: true }
  | { success: false; error: string };

export async function resendOtpAction(): Promise<ResendOtpResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }

  const [lastCode] = await db
    .select()
    .from(otpCodes)
    .where(eq(otpCodes.userId, session.user.id))
    .orderBy(desc(otpCodes.createdAt))
    .limit(1);

  if (lastCode && Date.now() - lastCode.createdAt.getTime() < RESEND_COOLDOWN_MS) {
    const waitSeconds = Math.ceil(
      (RESEND_COOLDOWN_MS - (Date.now() - lastCode.createdAt.getTime())) / 1000
    );
    return { success: false, error: `Please wait ${waitSeconds}s before requesting a new code.` };
  }

  try {
    await generateOtp(session.user.id);
  } catch {
    return { success: false, error: "Couldn't send a new code right now. Please try again shortly." };
  }

  return { success: true };
}
