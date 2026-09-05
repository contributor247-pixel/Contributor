import { randomBytes } from "crypto";
import { render } from "@react-email/components";
import { db } from "@/lib/db";
import { resend } from "@/lib/resend";
import { verificationTokens } from "../../drizzle/schema/index";
import { VerifyEmail } from "@/emails/verify-email";
import type { users } from "../../drizzle/schema/users";

type User = typeof users.$inferSelect;

const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export async function sendVerificationEmail(user: User): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);

  await db.insert(verificationTokens).values({
    identifier: user.email,
    token,
    expires,
  });

  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
  const verifyUrl = `${baseUrl}/verify-email?token=${token}&email=${encodeURIComponent(user.email)}`;

  const html = await render(VerifyEmail({ name: user.name ?? "", verifyUrl }));

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "Contributor <onboarding@resend.dev>",
    to: user.email,
    subject: "Verify your email to finish setting up your Contributor account",
    html,
  });

  // The Resend SDK resolves (never rejects) on an API-level failure — it
  // returns { error } instead of throwing. Without this check, a bad API
  // key or a suspended domain would silently "succeed": the token is
  // already written above, the caller (signupAction) reports success, and
  // the user is told to check an email that was never sent, with no way
  // to tell what went wrong.
  if (error) {
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
}
