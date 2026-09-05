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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F7F6F4] px-6 text-center">
      <div className="max-w-md rounded-[4px] border border-[#E7E5E1] bg-white p-10 shadow-sm">
        {status === "success" ? (
          <>
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-[#1E8E5A]" />
            <h1 className="mb-2 font-serif text-2xl font-semibold text-[#111114]">
              Email verified
            </h1>
            <p className="mb-6 text-sm text-[#7B7A7F]">
              Your account is confirmed. You can now sign in to Contributor.
            </p>
            <button
              type="button"
              onClick={() => open("login")}
              className="h-12 w-full rounded-[4px] bg-[#111114] text-sm font-semibold text-white transition-colors hover:bg-[#C8102E]"
            >
              Continue to sign in
            </button>
          </>
        ) : (
          <>
            <XCircle className="mx-auto mb-4 h-12 w-12 text-[#D93025]" />
            <h1 className="mb-2 font-serif text-2xl font-semibold text-[#111114]">
              {status === "expired" ? "This link has expired" : "This link is invalid"}
            </h1>
            <p className="mb-6 text-sm text-[#7B7A7F]">
              {status === "expired"
                ? "Verification links expire after 24 hours. Request a new one below."
                : "This verification link is invalid or has already been used."}
            </p>
            {email && (
              <>
                {resendState === "sent" ? (
                  <p className="rounded-[4px] border border-[#1E8E5A] bg-[#1E8E5A0f] px-4 py-3 text-sm text-[#1E8E5A]">
                    A new verification email is on its way to {email}.
                  </p>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendState === "sending"}
                      className="h-12 w-full rounded-[4px] border border-[#111114] text-sm font-semibold text-[#111114] transition-colors hover:bg-[#111114] hover:text-white disabled:cursor-not-allowed disabled:border-[#D3D0CA] disabled:text-[#B0AFAA]"
                    >
                      {resendState === "sending" ? "Sending..." : "Resend verification email"}
                    </button>
                    {resendState === "error" && (
                      <p className="mt-3 text-sm text-[#D93025]">{resendError}</p>
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
