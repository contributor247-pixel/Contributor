"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut, getSession } from "next-auth/react";
import { ShieldCheck, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { loginSchema } from "@/lib/validators/auth";
import { useShake } from "@/hooks/use-shake";

// Deliberately its own visual language — dark, plain, no serif
// wordmark/hero/marketing framing — so this reads unmistakably as a
// separate, owner-only entry point rather than the public sign-in.
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
      // Deliberately vague for anything that isn't plain wrong
      // credentials — this page shouldn't confirm whether a given
      // email belongs to a non-admin account at all.
      setFormError(
        result.code === "invalid-credentials"
          ? "Incorrect email or password."
          : "Unable to sign in. Please try again."
      );
      setShakeKey((k) => k + 1);
      return;
    }

    const session = await getSession();
    if (session?.user?.role !== "admin") {
      // A real account, just not an admin one — sign it back out
      // rather than leave a non-admin session active on this page,
      // and don't say more than that.
      await signOut({ redirect: false });
      setFormError("This account does not have admin access.");
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
    <div className="flex min-h-screen items-center justify-center bg-ink px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
              Contributor
            </p>
            <h1 className="mt-1 font-serif text-2xl font-semibold text-white">Admin Sign In</h1>
          </div>
          <p className="text-sm text-white/60">
            Restricted to platform administrators.
          </p>
        </div>

        <form
          ref={shakeRef}
          onSubmit={handleSubmit}
          className="rounded-[4px] border border-white/10 bg-white/[0.04] p-6"
        >
          <div className="mb-4">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                type="email"
                placeholder="Admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                className="h-12 w-full rounded-[4px] border border-white/15 bg-transparent pl-11 pr-4 text-white placeholder:text-white/40 transition-colors focus:border-white/40 focus:outline-none"
              />
            </div>
            {errors.email && <p role="alert" className="mt-1 text-sm text-error">{errors.email}</p>}
          </div>

          <div className="mb-6">
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="h-12 w-full rounded-[4px] border border-white/15 bg-transparent pl-11 pr-12 text-white placeholder:text-white/40 transition-colors focus:border-white/40 focus:outline-none"
              />
              <button
                type="button"
                aria-label={passwordVisible ? "Hide password" : "Show password"}
                aria-pressed={passwordVisible}
                onClick={() => setPasswordVisible((v) => !v)}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-[4px] text-white/40 transition-colors hover:text-white"
              >
                {passwordVisible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
              </button>
            </div>
            {errors.password && <p role="alert" className="mt-1 text-sm text-error">{errors.password}</p>}
          </div>

          {formError && (
            <p role="alert" className="mb-4 text-sm text-error">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full rounded-[4px] bg-white text-sm font-semibold text-ink transition-colors hover:bg-primary-subtle disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/50">
          This page is for platform administrators only.
        </p>
      </div>
    </div>
  );
}
