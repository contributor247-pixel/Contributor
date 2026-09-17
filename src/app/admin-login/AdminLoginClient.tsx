"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, signOut, getSession } from "next-auth/react";
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldAlert, KeyRound, Loader2 } from "lucide-react";
import { loginSchema } from "@/lib/validators/auth";
import { useShake } from "@/hooks/use-shake";

export function AdminLoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const shakeRef = useShake(shakeKey);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const parsed = loginSchema.safeParse({ email, password, rememberMe: false });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString();
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      setShakeKey((k) => k + 1);
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    setIsSubmitting(false);

    if (result?.error) {
      setFormError(
        result.code === "invalid-credentials"
          ? "Incorrect administrative email or password."
          : "Unable to authorize session. Please verify your credentials and try again."
      );
      setShakeKey((k) => k + 1);
      return;
    }

    const session = await getSession();
    if (session?.user?.role !== "admin") {
      await signOut({ redirect: false });
      setFormError("This account does not possess administrator credentials.");
      setShakeKey((k) => k + 1);
      return;
    }

    if (!session.user.twoFactorVerified) {
      router.push("/verify-otp?next=/dashboard/admin");
      return;
    }
    router.push("/dashboard/admin");
    router.refresh();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0C0D12] px-4 py-12 selection:bg-primary selection:text-white">
      {/* Ambient background glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/15 blur-[140px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-1/4 bottom-1/4 h-[350px] w-[350px] rounded-full bg-[#1e1b4b]/30 blur-[120px]"
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Top Branding Card */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/15 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-[#FF85A2] backdrop-blur-md shadow-xs mb-4">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <ShieldCheck className="h-3.5 w-3.5" />
            ADMINISTRATIVE GATEWAY
          </div>
          
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Contributor Admin
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-white/60">
            Secure sign-in for platform operations, users, &amp; moderation.
          </p>
        </div>

        {/* Form Container Card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 sm:p-9 shadow-2xl backdrop-blur-2xl">
          <form ref={shakeRef} onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/70">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  type="email"
                  placeholder="admin@contributor.app"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  className="h-12 w-full rounded-2xl border border-white/15 bg-white/[0.03] pl-10 pr-4 text-sm text-white placeholder:text-white/30 shadow-inner transition-all focus:border-primary focus:bg-white/[0.06] focus:outline-none focus:ring-4 focus:ring-primary/20"
                />
              </div>
              {errors.email && (
                <p role="alert" className="mt-1.5 text-xs font-medium text-red-400">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70">
                  Password
                </label>
                <span className="text-[11px] text-white/40">2FA Enforced</span>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  type={passwordVisible ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="h-12 w-full rounded-2xl border border-white/15 bg-white/[0.03] pl-10 pr-11 text-sm text-white placeholder:text-white/30 shadow-inner transition-all focus:border-primary focus:bg-white/[0.06] focus:outline-none focus:ring-4 focus:ring-primary/20"
                />
                <button
                  type="button"
                  aria-label={passwordVisible ? "Hide password" : "Show password"}
                  aria-pressed={passwordVisible}
                  onClick={() => setPasswordVisible((v) => !v)}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-white/40 transition-colors hover:text-white"
                >
                  {passwordVisible ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p role="alert" className="mt-1.5 text-xs font-medium text-red-400">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Form Error Callout */}
            {formError && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs font-medium text-red-300"
              >
                <ShieldAlert className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary via-[#9E1F46] to-primary bg-size-200 bg-pos-0 hover:bg-pos-100 text-sm font-semibold tracking-wide text-white shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-[1.01] hover:shadow-primary/40 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  <span>Authorize &amp; Continue</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Security footnote */}
          <div className="mt-6 border-t border-white/10 pt-5 text-center">
            <div className="flex items-center justify-center gap-2 text-[11px] text-white/40">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>TLS 1.3 · Two-Factor OTP · Audit Logged</span>
            </div>
          </div>
        </div>

        {/* Return Link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-white/50 transition-colors hover:text-white"
          >
            <span>&larr; Return to Contributor Publication</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
