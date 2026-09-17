"use server";

import { randomBytes } from "crypto";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { signIn } from "@/lib/auth";
import { users, verificationTokens, autoLoginTokens } from "../../../drizzle/schema/index";
import { sendVerificationEmail } from "@/lib/email";

const AUTO_LOGIN_TOKEN_TTL_MS = 60 * 1000;

export type VerifyEmailResult =
  | { success: true; autoLoginToken: string; email: string }
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

  const [user] = await db
    .update(users)
    .set({ emailVerified: new Date() })
    .where(eq(users.email, record.identifier))
    .returning({ id: users.id, email: users.email });

  // Mints the one-time credential completeAutoLoginAction exchanges for
  // a real session — docs/01_ApplicationFlow.md Flow A step 6 requires
  // the visitor to be auto-logged in right after verifying, not shown a
  // second manual sign-in form. 60s TTL: only needs to survive this
  // page's own immediate client-side redirect, not double as a general
  // passwordless-login window.
  const autoLoginToken = randomBytes(32).toString("hex");
  await db.insert(autoLoginTokens).values({
    token: autoLoginToken,
    userId: user.id,
    expires: new Date(Date.now() + AUTO_LOGIN_TOKEN_TTL_MS),
  });

  return { success: true, autoLoginToken, email: user.email };
}

export type CompleteAutoLoginResult =
  | { success: true }
  | { success: false; error: string };

// Called client-side immediately after a successful verifyEmailAction,
// exchanging the one-time token for a real signed-in session via the
// Credentials provider's autoLoginToken path (src/lib/auth.ts). Kept as
// its own action (rather than calling signIn() inside
// verifyEmailAction) because setting the session cookie is only valid
// from a Server Action/Route Handler invoked by a client request, not
// during a Server Component's render — verifyEmailAction runs as part
// of rendering the /verify-email page itself.
export async function completeAutoLoginAction(
  email: string,
  autoLoginToken: string
): Promise<CompleteAutoLoginResult> {
  try {
    await signIn("credentials", { email, autoLoginToken, redirect: false });
    return { success: true };
  } catch {
    return { success: false, error: "Couldn't complete sign-in automatically. Please sign in manually." };
  }
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
