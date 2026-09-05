import { randomInt, createHash } from "crypto";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { otpCodes, users } from "../../drizzle/schema/index";
import { resend } from "@/lib/resend";
import { render } from "@react-email/components";
import { OtpCodeEmail } from "@/emails/otp-code";

const OTP_TTL_MS = 10 * 60 * 1000;

function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

function generateSixDigitCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export async function generateOtp(userId: string): Promise<void> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) {
    throw new Error("User not found");
  }

  const code = generateSixDigitCode();
  const codeHash = hashCode(code);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await db.insert(otpCodes).values({ userId, codeHash, expiresAt });

  const html = await render(OtpCodeEmail({ name: user.name ?? "", code }));

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "Contributor <onboarding@resend.dev>",
    to: user.email,
    subject: "Your Contributor sign-in code",
    html,
  });

  if (error) {
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
}

export type VerifyOtpResult = "valid" | "invalid" | "expired";

export async function verifyOtp(userId: string, code: string): Promise<VerifyOtpResult> {
  const codeHash = hashCode(code);

  const [record] = await db
    .select()
    .from(otpCodes)
    .where(
      and(
        eq(otpCodes.userId, userId),
        eq(otpCodes.codeHash, codeHash),
        isNull(otpCodes.consumedAt)
      )
    )
    .orderBy(otpCodes.createdAt)
    .limit(1);

  if (!record) {
    return "invalid";
  }

  if (record.expiresAt < new Date()) {
    return "expired";
  }

  await db.update(otpCodes).set({ consumedAt: new Date() }).where(eq(otpCodes.id, record.id));

  return "valid";
}
