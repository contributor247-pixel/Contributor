import nodemailer, { type Transporter } from "nodemailer";

// Replaces the earlier Resend-based mailer (src/lib/resend.ts, now
// removed) with Gmail SMTP via nodemailer, per explicit request — Resend
// codes were not arriving reliably. Every call site already used the
// same `{ from, to, subject, html }` -> `{ error }` shape Resend's SDK
// exposed, so this keeps that exact shape instead of touching each of
// the 6 send sites' surrounding logic.
//
// The transporter is built lazily on first send rather than at module
// load time. Building it eagerly at the top of the module reads
// process.env.EMAIL_USER/EMAIL_PASS the instant this file is imported —
// which, under ESM, can run before a caller's own env-loading code
// executes (import statements are hoisted above other top-level code),
// silently producing a transporter with an empty `auth` object and a
// cryptic "Missing credentials" failure on every send. Deferring
// construction until the first real send call sidesteps that ordering
// hazard entirely (Next.js itself loads .env.local before any app code
// runs, so this only matters for scripts/tools that import this module
// directly).
let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST ?? "smtp.gmail.com",
      port: Number(process.env.EMAIL_PORT ?? 465),
      secure: Number(process.env.EMAIL_PORT ?? 465) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
}

interface SendEmailArgs {
  from: string;
  to: string;
  subject: string;
  html: string;
}

interface SendEmailResult {
  error: { message: string } | null;
}

export const mailer = {
  emails: {
    async send({ from, to, subject, html }: SendEmailArgs): Promise<SendEmailResult> {
      try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
          throw new Error("EMAIL_USER/EMAIL_PASS are not set — check .env.local");
        }

        // Gmail SMTP only accepts the authenticated account as the
        // envelope sender — unlike Resend, it will not relay mail "from"
        // an arbitrary verified domain. The display name portion of
        // `from` (e.g. "Contributor <...>") is kept; the address itself
        // is forced to the authenticated EMAIL_USER so Gmail doesn't
        // reject the send outright.
        const displayNameMatch = from.match(/^(.*)<.*>$/);
        const effectiveFrom = displayNameMatch
          ? `${displayNameMatch[1].trim()} <${process.env.EMAIL_USER}>`
          : process.env.EMAIL_USER;

        await getTransporter().sendMail({ from: effectiveFrom, to, subject, html });
        return { error: null };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error sending email";
        return { error: { message } };
      }
    },
  },
};
