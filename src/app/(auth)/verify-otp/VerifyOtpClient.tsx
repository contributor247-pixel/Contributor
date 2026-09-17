"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ShieldCheck, Mail, ArrowRight, RefreshCw, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { submitOtpAction, resendOtpAction } from "@/lib/actions/otp";

export function VerifyOtpClient({ redirectTo = "/" }: { redirectTo?: string }) {
  const { update } = useSession();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");
  const [resendError, setResendError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    if (!/^\d{6}$/.test(code)) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }
    setIsSubmitting(true);
    const result = await submitOtpAction(code);
    if (!result.success) {
      setIsSubmitting(false);
      setError(result.error);
      return;
    }

    try {
      await update({ twoFactorVerified: true });
      router.push(redirectTo);
      router.refresh();
    } catch {
      setIsSubmitting(false);
      setError("Verified, but could not finalize authentication. Please refresh the page.");
    }
  };

  const handleResend = async () => {
    setResendError(null);
    setResendState("sending");
    const result = await resendOtpAction();
    if (result.success) {
      setResendState("sent");
      setCountdown(60);
      setTimeout(() => setResendState("idle"), 60_000);
    } else {
      setResendState("idle");
      setResendError(result.error);
    }
  };

  const handleInputChange = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 6);
    setCode(cleaned);
    setError(null);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-bg px-4 py-12 selection:bg-primary selection:text-white">
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[420px] w-[420px] rounded-full bg-primary/10 blur-[120px]"
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- static asset in public/ */}
          <img
            src="/logo/logo.png"
            alt="Contributor"
            className="h-10 w-auto sm:h-12 transition-transform hover:scale-105 duration-200"
          />
          <span className="mt-2 font-serif text-xs italic tracking-wider text-text-muted">
            The Discovery Journal
          </span>
        </div>

        {/* Verification Card */}
        <div className="rounded-3xl border border-border/80 bg-surface p-7 sm:p-9 shadow-xl backdrop-blur-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary mb-3">
              <ShieldCheck className="h-3.5 w-3.5" />
              SECURITY VERIFICATION
            </div>
            
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-text-heading">
              Enter Verification Code
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-text-muted leading-relaxed">
              We sent a 6-digit one-time passcode to your email. Passcodes expire after 10 minutes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Segmented OTP Visual Interface */}
            <div className="relative">
              {/* Actual underlying input for accessibility, mobile paste, and virtual keyboard */}
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => handleInputChange(e.target.value)}
                className="absolute inset-0 h-full w-full opacity-0 cursor-pointer z-20"
                aria-label="6-digit verification code"
              />

              {/* 6 Segmented Digit Cells */}
              <div className="flex items-center justify-between gap-2 sm:gap-2.5">
                {Array.from({ length: 6 }).map((_, index) => {
                  const digit = code[index] || "";
                  const isFocused = code.length === index || (code.length === 6 && index === 5);
                  
                  return (
                    <div
                      key={index}
                      className={`flex h-13 w-11 sm:h-15 sm:w-13 items-center justify-center rounded-2xl border text-xl sm:text-2xl font-mono font-bold transition-all duration-150 ${
                        digit
                          ? "border-primary/60 bg-surface text-text-heading shadow-xs"
                          : isFocused
                          ? "border-primary bg-primary/5 text-primary ring-4 ring-primary/15 scale-105"
                          : "border-border/80 bg-bg-alt/40 text-text-muted/40"
                      }`}
                    >
                      {digit ? (
                        <span>{digit}</span>
                      ) : isFocused ? (
                        <span className="h-5 w-0.5 animate-pulse bg-primary rounded-full" />
                      ) : (
                        <span className="text-sm text-text-muted/40 font-sans">·</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-medium text-red-600 dark:text-red-400"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isSubmitting || code.length !== 6}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-semibold text-white shadow-md transition-all hover:bg-primary hover:shadow-lg active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-bg-alt disabled:text-text-muted disabled:shadow-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Passcode...</span>
                </>
              ) : (
                <>
                  <span>Verify &amp; Continue</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Resend Section */}
          <div className="mt-6 border-t border-border/80 pt-5 text-center text-xs">
            {resendState === "sent" ? (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>A new 6-digit code has been dispatched to your email.</span>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-1 text-text-muted">
                <span>Didn&apos;t receive the security code?</span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendState === "sending" || countdown > 0}
                  className="font-semibold text-primary underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-text-muted"
                >
                  {resendState === "sending"
                    ? "Dispatching new code..."
                    : countdown > 0
                    ? `Resend available in ${countdown}s`
                    : "Resend code"}
                </button>
              </div>
            )}

            {resendError && (
              <p role="alert" className="mt-2 text-xs font-medium text-error">
                {resendError}
              </p>
            )}
          </div>
        </div>

        {/* Footnote links */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-text-muted transition-colors hover:text-text-heading"
          >
            <span>&larr; Return to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
