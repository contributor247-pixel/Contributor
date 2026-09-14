"use server";

import { headers } from "next/headers";
import { render } from "@react-email/components";
import { mailer } from "@/lib/mailer";
import { contactSchema, type ContactInput } from "@/lib/validators/contact";
import { ContactMessageEmail } from "@/emails/contact-message";

export type ContactActionResult = { success: true } | { success: false; error: string };

// The address contact-page submissions are delivered to — the
// platform's own Admin inbox, per explicit product decision (no
// separate support mailbox exists yet).
const CONTACT_RECIPIENT = "contributor247@gmail.com";

// Simple in-memory per-IP rate limit — resets on server restart, which
// is an acceptable trade-off for an unauthenticated contact form (no
// user session to key a DB-backed limiter off, and this isn't
// security-critical the way login/OTP rate limiting is). Not shared
// across multiple server instances in a real deployment, but this app
// has no such deployment yet.
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const lastSubmissionByIp = new Map<string, number>();

export async function submitContactAction(input: ContactInput): Promise<ContactActionResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;

  // x-forwarded-for's first entry is the original client — falls back
  // to a constant key if absent (e.g. local dev with no proxy), which
  // just means local requests share one rate-limit bucket rather than
  // being unlimited.
  const headersList = await headers();
  const clientIp = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const lastSubmission = lastSubmissionByIp.get(clientIp);
  if (lastSubmission && Date.now() - lastSubmission < RATE_LIMIT_WINDOW_MS) {
    const waitSeconds = Math.ceil((RATE_LIMIT_WINDOW_MS - (Date.now() - lastSubmission)) / 1000);
    return { success: false, error: `Please wait ${waitSeconds}s before sending another message.` };
  }

  const html = await render(
    ContactMessageEmail({ name: data.name, email: data.email, subject: data.subject, message: data.message })
  );

  const { error } = await mailer.emails.send({
    from: `${data.name} via Contributor <onboarding@contributor.app>`,
    to: CONTACT_RECIPIENT,
    subject: `[Contact] ${data.subject}`,
    html,
  });

  if (error) {
    return { success: false, error: "Couldn't send your message right now. Please try again shortly." };
  }

  lastSubmissionByIp.set(clientIp, Date.now());
  return { success: true };
}
