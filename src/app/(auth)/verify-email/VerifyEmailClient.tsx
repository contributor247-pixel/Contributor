"use client";

import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { useAuthModal } from "@/hooks/use-auth-modal";
import { resendVerificationAction } from "@/lib/actions/verify-email";

interface VerifyEmailClientProps {
  status: "success" | "invalid" | "expired";
  email?: string;
}

export function VerifyEmailClient({ status, email }: VerifyEmailClientProps) {
  const { open } = useAuthModal();
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [resendError, setResendError] = useState<string | null>(null);

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element -- static asset in public/, not worth next/image's overhead for a fixed-size auth-page logo */}
      <img src="/logo/logo.png" alt="Contributor" className="mb-6 h-7 w-auto" />
      <div className="max-w-md rounded-[4px] border border-border bg-surface p-10 shadow-sm">
        {status === "success" ? (
          <>
            <CheckCircle className="animate__animated animate__bounceIn motion-reduce:animate-none mx-auto mb-4 h-12 w-12 text-success" />
            <h1 className="mb-2 font-serif text-2xl font-semibold text-text-heading">
              Email verified
            </h1>
            <p className="mb-6 text-sm text-text-muted">
              Your account is confirmed. You can now sign in to Contributor.
            </p>
            <button
              type="button"
              onClick={() => open("login")}
              className="h-12 w-full rounded-[4px] bg-ink text-sm font-semibold text-white transition-colors hover:bg-primary"
            >
              Continue to sign in
            </button>
          </>
        ) : (
          <>
            <XCircle className="mx-auto mb-4 h-12 w-12 text-error" />
            <h1 className="mb-2 font-serif text-2xl font-semibold text-text-heading">
              {status === "expired" ? "This link has expired" : "This link is invalid"}
            </h1>
            <p className="mb-6 text-sm text-text-muted">
              {status === "expired"
                ? "Verification links expire after 24 hours. Request a new one below."
                : "This verification link is invalid or has already been used."}
            </p>
            {email && (
              <>
                {resendState === "sent" ? (
                  <p className="rounded-[4px] border border-success bg-success/5 px-4 py-3 text-sm text-success">
                    A new verification email is on its way to {email}.
                  </p>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendState === "sending"}
                      className="h-12 w-full rounded-[4px] border border-ink text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:border-border-strong disabled:text-text-muted"
                    >
                      {resendState === "sending" ? "Sending..." : "Resend verification email"}
                    </button>
                    {resendState === "error" && (
                      <p role="alert" className="mt-3 text-sm text-error">{resendError}</p>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
