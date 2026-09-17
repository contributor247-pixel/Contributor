import { randomInt, createHash } from "crypto";
import { eq, and, isNull, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { otpCodes, users } from "../../drizzle/schema/index";
import { mailer } from "@/lib/mailer";
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

  // Captured once and reused for both this row's own createdAt AND as
  // the invalidation sweep's cutoff below. otpCodes.createdAt has a
  // DB-side defaultNow() default — a different clock than this Node
  // process's Date.now(). Comparing an app-clock cutoff against a
  // DB-clock column let clock skew alone (a few hundred ms between
  // this server and Neon's Postgres is normal) produce a genuinely
  // impossible "consumedAt before createdAt" state, invalidating a
  // code before it was ever usable. Passing this same value in
  // explicitly as createdAt on the insert below puts both sides of
  // every comparison on one clock, closing that gap. The neon-http
  // driver has no transaction support, so this scoping is also what
  // keeps a genuinely concurrent second call (e.g. "Resend code"
  // double-tapped) from invalidating the code the user was just shown
  // as current — each call's sweep only ever touches rows that
  // existed strictly before it started.
  const generationStartedAt = new Date();
  const code = generateSixDigitCode();
  const codeHash = hashCode(code);
  const expiresAt = new Date(generationStartedAt.getTime() + OTP_TTL_MS);

  // Without this, requesting a new code (e.g. via "Resend code") left
  // the previous one still valid for the rest of its 10-minute window
  // — two simultaneously-valid codes for the same account instead of
  // only the one the user was just told is current.
  await db
    .update(otpCodes)
    .set({ consumedAt: generationStartedAt })
    .where(
      and(
        eq(otpCodes.userId, userId),
        isNull(otpCodes.consumedAt),
        lt(otpCodes.createdAt, generationStartedAt)
      )
    );

  await db.insert(otpCodes).values({ userId, codeHash, expiresAt, createdAt: generationStartedAt });

  const html = await render(OtpCodeEmail({ name: user.name ?? "", code }));

  const { error } = await mailer.emails.send({
    from: process.env.EMAIL_FROM ?? "Contributor <onboarding@contributor.app>",
    to: user.email,
    subject: "Your Contributor sign-in code",
    html,
  });

  if (error) {
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
}

export type VerifyOtpResult = "valid" | "invalid" | "expired";

// Test-only escape hatch for QA-walking Author/Admin flows without
// real email/IMAP access to read the actual emailed code (which is
// only ever stored as a SHA-256 hash — genuinely unrecoverable by
// design, unlike the plaintext email-verification token). Requires
// BOTH a dedicated env flag (never set in a real deployment) AND the
// account's own email ending in @contributor.local (this repo's fixed
// test-account domain), so this can never activate for a real user
// even if the env flag were mistakenly left on somewhere. Confirmed
// with the user before adding — see docs/01_ApplicationFlow.md's
// manual QA walkthrough (Flows C/E/G/H/I all require an Author/Admin
// login to proceed past their first step).
async function isTestOtpBypassAllowed(userId: string): Promise<boolean> {
  if (process.env.ALLOW_TEST_OTP_BYPASS !== "true") return false;
  const [user] = await db.select({ email: users.email }).from(users).where(eq(users.id, userId)).limit(1);
  return !!user?.email?.endsWith("@contributor.local");
}

export async function verifyOtp(userId: string, code: string): Promise<VerifyOtpResult> {
  if (code === "000000" && (await isTestOtpBypassAllowed(userId))) {
    return "valid";
  }

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
