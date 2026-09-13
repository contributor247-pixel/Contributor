"use client";

import { useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Mail, Lock, User } from "lucide-react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAuthModal } from "@/hooks/use-auth-modal";
import { useShake } from "@/hooks/use-shake";
import { signupAction } from "@/lib/actions/auth";
import { resendVerificationAction } from "@/lib/actions/verify-email";
import { loginSchema, signupSchema } from "@/lib/validators/auth";

const modalVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1 },
};

export function AuthModal() {
  const { isOpen, mode, close, setMode } = useAuthModal();
  const prefersReducedMotion = useReducedMotion();

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && close()}>
      <AnimatePresence>
        {isOpen && (
          <DialogPrimitive.Portal keepMounted>
            <DialogPrimitive.Backdrop
              render={
                <motion.div
                  className="fixed inset-0 z-50 bg-[rgba(10,10,12,0.72)]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0.01 : 0.15 }}
                />
              }
            />
            <DialogPrimitive.Popup
              aria-describedby={undefined}
              render={
                <motion.div
                  className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-[1050px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-md bg-white shadow-2xl outline-none"
                  variants={prefersReducedMotion ? undefined : modalVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{ duration: prefersReducedMotion ? 0.01 : 0.2, ease: [0.22, 1, 0.36, 1] }}
                />
              }
            >
              <DialogPrimitive.Title className="sr-only">
                {mode === "login" ? "Sign in to Contributor" : "Create your Contributor account"}
              </DialogPrimitive.Title>
              <DialogPrimitive.Close
                aria-label="Close"
                className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white md:h-9 md:w-9 md:text-ink md:hover:bg-black/5"
              >
                <X className="h-5 w-5" />
              </DialogPrimitive.Close>

              <div className="flex max-h-[90vh] flex-col overflow-y-auto md:h-[600px] md:flex-row md:overflow-visible">
                <DarkPanel mode={mode} onSignUpClick={() => setMode("signup")} />
                <div className="flex flex-1 items-center justify-center px-6 py-10 md:px-12 md:py-0">
                  {mode === "login" ? (
                    <LoginForm onSuccess={close} onSwitchToSignup={() => setMode("signup")} />
                  ) : (
                    <SignupForm onSuccess={() => setMode("login")} onSwitchToLogin={() => setMode("login")} />
                  )}
                </div>
              </div>
            </DialogPrimitive.Popup>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}

function DarkPanel({ mode, onSignUpClick }: { mode: "login" | "signup"; onSignUpClick: () => void }) {
  return (
    // Kept compact on mobile (shorter min-height, tighter padding, no
    // duplicate CTA button) so the actual form isn't pushed below the
    // fold under the marketing copy — the full-size panel is reserved
    // for md+ where there's room for both without scrolling.
    <div className="relative flex min-h-[120px] shrink-0 items-center justify-center overflow-hidden bg-ink px-6 py-6 text-center md:min-h-0 md:w-[45%] md:px-12 md:py-10">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_30%_15%,rgba(139,30,63,0.35),transparent_55%),radial-gradient(circle_at_80%_85%,rgba(139,30,63,0.18),transparent_50%),linear-gradient(160deg,#1c1c21_0%,#0b0b0d_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-4 rounded-[2px] border border-white/[0.08] md:inset-8"
      />
      <div className="relative z-10 flex flex-col items-center gap-2 md:gap-4">
        <span className="hidden font-serif text-xs uppercase tracking-[0.3em] text-primary-subtle/70 md:block">
          Contributor
        </span>
        <h2 className="font-serif text-xl font-semibold text-white md:text-4xl">
          {mode === "login" ? "Create Account" : "Welcome to Contributor"}
        </h2>
        {mode === "login" ? (
          <>
            <p className="hidden max-w-xs text-sm text-white/80 md:block">
              Sign up to create your account and unlock all the features Contributor has to offer!
            </p>
            <button
              type="button"
              onClick={onSignUpClick}
              className="mt-2 hidden rounded-[4px] bg-white px-8 py-3 text-sm font-semibold text-ink transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-white md:inline-block"
            >
              Sign Up
            </button>
          </>
        ) : (
          <p className="hidden max-w-xs text-sm text-white/80 md:block">
            Join a community of writers and readers unlocking premium stories and publishing with fellow Authors.
          </p>
        )}
      </div>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1 text-sm text-error">
      {message}
    </p>
  );
}

function IconInput({
  icon: Icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
      <input
        {...props}
        className="h-12 w-full rounded-[4px] border border-border-strong pl-11 pr-4 text-text-heading placeholder:text-text-muted transition-colors focus:border-ink focus:outline-none focus:ring-[3px] focus:ring-[#14141a14]"
      />
    </div>
  );
}

function LoginForm({
  onSuccess,
  onSwitchToSignup,
}: {
  onSuccess: () => void;
  onSwitchToSignup: () => void;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [showResendLink, setShowResendLink] = useState(false);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setShowResendLink(false);
    const parsed = loginSchema.safeParse({ email, password, rememberMe });
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
    // Remember Me is not currently wired to session length — see the
    // comment on SESSION_MAX_AGE in src/lib/auth.ts for why. The
    // checkbox stays in the UI to match the design reference.
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setIsSubmitting(false);
    if (result?.error) {
      switch (result.code) {
        case "email-not-verified":
          setFormError("Please verify your email before signing in.");
          setShowResendLink(true);
          break;
        case "account-suspended":
          setFormError("Your account has been suspended, contact support.");
          break;
        case "invalid-credentials":
          setFormError("Incorrect email or password.");
          break;
        default:
          setFormError("Something went wrong. Please try again.");
      }
      setShakeKey((k) => k + 1);
      return;
    }

    const session = await getSession();
    // Navigate before closing the modal — closing flips useAuthModal's
    // isOpen to false, which unmounts this component's subtree
    // immediately (it's nested inside AnimatePresence, but not as a
    // direct motion child, so React doesn't defer the unmount for the
    // exit animation the way it would for a top-level animated child).
    // Calling router.push after that unmount was intermittently dropping
    // the navigation.
    if (session?.user && !session.user.twoFactorVerified) {
      router.push("/verify-otp");
    }
    onSuccess();
  };

  const shakeRef = useShake(shakeKey);

  return (
    <form ref={shakeRef} onSubmit={handleSubmit} className="w-full max-w-sm">
      <h1 className="mb-1 font-serif text-2xl font-semibold text-text-heading md:text-3xl">
        Sign in to Contributor
      </h1>
      <p className="mb-7 text-sm text-text-muted">Welcome back — enter your details to continue.</p>

      <div className="mb-4">
        <IconInput
          icon={Mail}
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FieldError message={errors.email} />
      </div>

      <div className="mb-4">
        <IconInput
          icon={Lock}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <FieldError message={errors.password} />
      </div>

      <label className="mb-6 flex items-center gap-2 text-sm text-text-body">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="h-4 w-4 rounded border-border-strong accent-ink"
        />
        Remember Me
      </label>

      <FieldError message={formError ?? undefined} />
      {showResendLink &&
        (resendState === "sent" ? (
          <p className="mt-1 text-sm text-success">Verification email sent — check your inbox.</p>
        ) : (
          <button
            type="button"
            disabled={resendState === "sending"}
            onClick={async () => {
              setResendState("sending");
              await resendVerificationAction(email);
              setResendState("sent");
            }}
            className="mt-1 text-sm text-ink underline-offset-2 hover:underline disabled:text-text-muted"
          >
            {resendState === "sending" ? "Sending..." : "Resend verification email"}
          </button>
        ))}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 h-12 w-full rounded-[4px] bg-ink text-sm font-semibold text-white transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:bg-border-strong disabled:text-text-muted"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>

      <div className="mt-5 flex items-center justify-center text-sm">
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="text-text-muted transition-colors hover:text-ink"
        >
          Don&apos;t have an account? <span className="font-semibold text-ink underline-offset-2 hover:underline">Create one</span>
        </button>
      </div>
    </form>
  );
}

function SignupForm({
  onSuccess,
  onSwitchToLogin,
}: {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"reader" | "author">("reader");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [successIsWarning, setSuccessIsWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const shakeRef = useShake(shakeKey);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const parsed = signupSchema.safeParse({ name, email, password, confirmPassword, role });
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
    const result = await signupAction(parsed.data);
    setIsSubmitting(false);
    if (!result.success) {
      setFormError(result.error);
      setShakeKey((k) => k + 1);
      return;
    }
    if (result.emailSendFailed) {
      setSuccessIsWarning(true);
      setSuccessMessage(
        "Account created, but we couldn't send the verification email right now. You can request a new one from the verification page once you sign in."
      );
    } else {
      setSuccessMessage("Account created. Check your email to verify your account before signing in.");
    }
    setTimeout(onSuccess, result.emailSendFailed ? 3200 : 1800);
  };

  return (
    <form ref={shakeRef} onSubmit={handleSubmit} className="w-full max-w-sm">
      <h1 className="mb-1 font-serif text-2xl font-semibold text-text-heading md:text-3xl">
        Create your account
      </h1>
      <p className="mb-6 text-sm text-text-muted">Takes less than a minute — no credit card required.</p>

      {successMessage ? (
        <p
          className={
            successIsWarning
              ? "rounded-[4px] border border-warning bg-warning/10 px-4 py-3 text-sm text-warning"
              : "rounded-[4px] border border-success bg-success/10 px-4 py-3 text-sm text-success"
          }
        >
          {successMessage}
        </p>
      ) : (
        <>
          <div className="mb-4">
            <IconInput
              icon={User}
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <FieldError message={errors.name} />
          </div>

          <div className="mb-4">
            <IconInput
              icon={Mail}
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FieldError message={errors.email} />
          </div>

          <div className="mb-4">
            <IconInput
              icon={Lock}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <FieldError message={errors.password} />
          </div>

          <div className="mb-4">
            <IconInput
              icon={Lock}
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <FieldError message={errors.confirmPassword} />
          </div>

          <fieldset className="mb-6">
            <legend className="mb-2 text-sm font-medium text-text-body">I am a...</legend>
            <div className="flex gap-2 text-sm">
              <label
                className={
                  role === "reader"
                    ? "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-[4px] border border-ink bg-ink/5 px-4 py-2.5 font-medium text-ink transition-colors"
                    : "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-[4px] border border-border-strong px-4 py-2.5 text-text-body transition-colors hover:border-text-muted"
                }
              >
                <input
                  type="radio"
                  name="role"
                  checked={role === "reader"}
                  onChange={() => setRole("reader")}
                  className="sr-only"
                />
                Reader
              </label>
              <label
                className={
                  role === "author"
                    ? "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-[4px] border border-ink bg-ink/5 px-4 py-2.5 font-medium text-ink transition-colors"
                    : "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-[4px] border border-border-strong px-4 py-2.5 text-text-body transition-colors hover:border-text-muted"
                }
              >
                <input
                  type="radio"
                  name="role"
                  checked={role === "author"}
                  onChange={() => setRole("author")}
                  className="sr-only"
                />
                Author
              </label>
            </div>
          </fieldset>

          <FieldError message={formError ?? undefined} />

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full rounded-[4px] bg-ink text-sm font-semibold text-white transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:bg-border-strong disabled:text-text-muted"
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>

          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-text-muted transition-colors hover:text-ink"
            >
              Already have an account? Sign in
            </button>
          </div>
        </>
      )}
    </form>
  );
}
