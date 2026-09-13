"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { submitOtpAction, resendOtpAction } from "@/lib/actions/otp";

export function VerifyOtpClient() {
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
    setIsSubmitting(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    await update({ twoFactorVerified: true });
    router.push("/");
    router.refresh();
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F7F6F4] px-6 text-center">
      <div className="w-full max-w-sm rounded-[4px] border border-[#E7E5E1] bg-white p-10">
        <h1 className="mb-2 font-serif text-2xl font-semibold text-[#111114]">
          Enter your code
        </h1>
        <p className="mb-6 text-sm text-[#7B7A7F]">
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
            className="mb-4 h-14 w-full rounded-[4px] border border-[#D3D0CA] text-center text-2xl tracking-[0.5em] text-[#111114] placeholder:text-[#D3D0CA] focus:border-[#111114] focus:outline-none focus:ring-[3px] focus:ring-[#11111414]"
          />
          {error && <p role="alert" className="mb-4 text-sm text-[#D93025]">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting || code.length !== 6}
            className="h-12 w-full rounded-[4px] bg-[#111114] text-sm font-semibold text-white transition-colors hover:bg-[#C8102E] disabled:cursor-not-allowed disabled:bg-[#C9C9C9] disabled:text-[#8A8A8A]"
          >
            {isSubmitting ? "Verifying..." : "Verify"}
          </button>
        </form>

        <div className="mt-4">
          {resendState === "sent" ? (
            <p role="status" className="text-sm text-[#1E8E5A]">A new code is on its way.</p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendState === "sending"}
              className="text-sm text-[#111114] underline-offset-2 hover:underline disabled:text-[#B0AFAA]"
            >
              {resendState === "sending" ? "Sending..." : "Resend code"}
            </button>
          )}
          {resendError && <p role="alert" className="mt-2 text-sm text-[#D93025]">{resendError}</p>}
        </div>
      </div>
    </div>
  );
}
