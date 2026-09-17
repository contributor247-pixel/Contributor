"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { submitOtpAction, resendOtpAction } from "@/lib/actions/otp";

export function VerifyOtpClient({ redirectTo = "/" }: { redirectTo?: string }) {
  const { update } = useSession();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");
  const [resendError, setResendError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setIsSubmitting(true);
    const result = await submitOtpAction(code);
    if (!result.success) {
      setIsSubmitting(false);
      setError(result.error);
      return;
    }
    // The code is already consumed server-side at this point — it
    // can't be retried, so if the session refresh below hangs or
    // fails, the button staying on "Verifying..." (rather than
    // resetting to a clickable "Verify" that would submit an
    // already-used code) is the honest state to show. A stuck loading
    // state is still better than a silent dead end with no
    // explanation of why nothing happened.
    try {
      await update({ twoFactorVerified: true });
      router.push(redirectTo);
      router.refresh();
    } catch {
      setIsSubmitting(false);
      setError("Verified, but couldn't complete sign-in. Please refresh the page.");
    }
  };

  const handleResend = async () => {
    setResendError(null);
    setResendState("sending");
    const result = await resendOtpAction();
    if (result.success) {
      setResendState("sent");
      setTimeout(() => setResendState("idle"), 60_000);
    } else {
      setResendState("idle");
      setResendError(result.error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element -- static asset in public/, not worth next/image's overhead for a fixed-size auth-page logo */}
      <img src="/logo/logo.png" alt="Contributor" className="mb-6 h-7 w-auto" />
      <div className="w-full max-w-sm rounded-[4px] border border-border bg-surface p-10 shadow-sm">
        <h1 className="mb-2 font-serif text-2xl font-semibold text-text-heading">
          Enter your code
        </h1>
        <p className="mb-6 text-sm text-text-muted">
          We sent a 6-digit code to your email. It expires in 10 minutes.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="mb-4 h-14 w-full rounded-[4px] border border-border-strong text-center text-2xl tracking-[0.5em] text-text-heading placeholder:text-border-strong focus:border-ink focus:outline-none focus:ring-[3px] focus:ring-[#14141a14]"
          />
          {error && <p role="alert" className="mb-4 text-sm text-error">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting || code.length !== 6}
            className="h-12 w-full rounded-[4px] bg-ink text-sm font-semibold text-white transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:bg-border-strong disabled:text-text-muted"
          >
            {isSubmitting ? "Verifying..." : "Verify"}
          </button>
        </form>

        <div className="mt-4">
          {resendState === "sent" ? (
            <p role="status" className="text-sm text-success">A new code is on its way.</p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendState === "sending"}
              className="text-sm text-ink underline-offset-2 hover:underline disabled:text-text-muted"
            >
              {resendState === "sending" ? "Sending..." : "Resend code"}
            </button>
          )}
          {resendError && <p role="alert" className="mt-2 text-sm text-error">{resendError}</p>}
        </div>
      </div>
    </div>
  );
}
