"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import { CheckCircle2, XCircle, Loader2, Mail, ArrowRight, ShieldCheck, RefreshCw } from "lucide-react";
import { useAuthModal } from "@/hooks/use-auth-modal";
import { resendVerificationAction, completeAutoLoginAction } from "@/lib/actions/verify-email";

interface VerifyEmailClientProps {
  status: "success" | "invalid" | "expired";
  email?: string;
  autoLoginToken?: string;
}

export function VerifyEmailClient({ status, email, autoLoginToken }: VerifyEmailClientProps) {
  const { open } = useAuthModal();
  const router = useRouter();
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [resendError, setResendError] = useState<string | null>(null);
  const [autoLoginState, setAutoLoginState] = useState<"signing-in" | "failed">("signing-in");

  useEffect(() => {
    if (status !== "success" || !email || !autoLoginToken) return;
    let cancelled = false;
    (async () => {
      const result = await completeAutoLoginAction(email, autoLoginToken);
      if (cancelled) return;
      if (!result.success) {
        setAutoLoginState("failed");
        return;
      }
      const session = await getSession();
      if (session?.user && !session.user.twoFactorVerified) {
        router.push("/verify-otp");
      } else {
        router.push("/");
        router.refresh();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, email, autoLoginToken, router]);

  const handleResend = async () => {
    if (!email) return;
    setResendState("sending");
    const result = await resendVerificationAction(email);
    if (result.success) {
      setResendState("sent");
    } else {
      setResendState("error");
      setResendError(result.error);
    }
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

        {/* Status Card */}
        <div className="rounded-3xl border border-border/80 bg-surface p-7 sm:p-9 shadow-xl backdrop-blur-md text-center">
          {status === "success" ? (
            <div className="space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                EMAIL VERIFIED
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-text-heading">
                Account Confirmed
              </h1>

              {autoLoginState === "signing-in" ? (
                <div className="space-y-4 pt-2">
                  <p className="text-xs sm:text-sm text-text-muted">
                    Your email address has been verified. Signing you in to your dashboard...
                  </p>
                  <div className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-bg-alt text-xs sm:text-sm font-semibold text-text-muted">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span>Signing in...</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  <p className="text-xs sm:text-sm text-text-muted">
                    Your account is fully verified. You can now sign in to Contributor.
                  </p>
                  <button
                    type="button"
                    onClick={() => open("login")}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-semibold text-white shadow-md transition-all hover:bg-primary hover:shadow-lg active:scale-[0.99]"
                  >
                    <span>Continue to Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
                <XCircle className="h-8 w-8" />
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1 text-xs font-semibold text-red-600 dark:text-red-400">
                VERIFICATION FAILED
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-text-heading">
                {status === "expired" ? "Link Expired" : "Invalid Link"}
              </h1>

              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                {status === "expired"
                  ? "Verification links expire after 24 hours for security. Request a fresh confirmation link below."
                  : "This verification link is invalid or has already been consumed."}
              </p>

              {email && (
                <div className="pt-2 space-y-3">
                  {resendState === "sent" ? (
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      A fresh confirmation link has been dispatched to <strong>{email}</strong>.
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendState === "sending"}
                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-semibold text-white shadow-md transition-all hover:bg-primary hover:shadow-lg disabled:cursor-not-allowed disabled:bg-bg-alt disabled:text-text-muted"
                      >
                        {resendState === "sending" ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Sending Email...</span>
                          </>
                        ) : (
                          <>
                            <Mail className="h-4 w-4" />
                            <span>Resend Verification Email</span>
                          </>
                        )}
                      </button>
                      {resendState === "error" && (
                        <p role="alert" className="text-xs font-medium text-error">
                          {resendError}
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footnote */}
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
