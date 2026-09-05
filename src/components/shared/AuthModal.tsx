"use client";

import { useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { signIn } from "next-auth/react";
import { useAuthModal } from "@/hooks/use-auth-modal";
import { signupAction } from "@/lib/actions/auth";
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
                className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white md:text-[#111114] md:hover:bg-black/5"
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
    <div className="relative flex min-h-[220px] shrink-0 items-center justify-center overflow-hidden bg-[#111114] px-8 py-10 text-center md:min-h-0 md:w-[45%] md:px-12">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(200,16,46,0.25),transparent_60%),linear-gradient(160deg,#1c1c21_0%,#0b0b0d_100%)]"
      />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <h2 className="font-serif text-3xl font-semibold text-white md:text-4xl">Create Account</h2>
        {mode === "login" ? (
          <>
            <p className="max-w-xs text-sm text-white/80">
              Sign up to create your account and unlock all the features Contributor has to offer!
            </p>
            <button
              type="button"
              onClick={onSignUpClick}
              className="mt-2 rounded-[4px] bg-white px-8 py-3 text-sm font-semibold text-[#111114] transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-white"
            >
              Sign Up
            </button>
          </>
        ) : (
          <p className="max-w-xs text-sm text-white/80">
            Already unlocking premium stories and publishing with fellow Authors — welcome back.
          </p>
        )}
      </div>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-[#D93025]">{message}</p>;
}

function LoginForm({
  onSuccess,
  onSwitchToSignup,
}: {
  onSuccess: () => void;
  onSwitchToSignup: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const parsed = loginSchema.safeParse({ email, password, rememberMe });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString();
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setIsSubmitting(false);
    if (result?.error) {
      setFormError(
        result.error === "CredentialsSignin"
          ? "Incorrect email or password."
          : "Something went wrong. Please try again."
      );
      return;
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm">
      <h1 className="mb-8 font-serif text-2xl font-semibold text-[#111114] md:text-3xl">
        Sign in to Contributor
      </h1>

      <div className="mb-4">
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 w-full rounded-[4px] border border-[#D3D0CA] px-4 text-[#111114] placeholder:text-[#7B7A7F] focus:border-[#111114] focus:outline-none focus:ring-[3px] focus:ring-[#11111414]"
        />
        <FieldError message={errors.email} />
      </div>

      <div className="mb-4">
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-12 w-full rounded-[4px] border border-[#D3D0CA] px-4 text-[#111114] placeholder:text-[#7B7A7F] focus:border-[#111114] focus:outline-none focus:ring-[3px] focus:ring-[#11111414]"
        />
        <FieldError message={errors.password} />
      </div>

      <label className="mb-6 flex items-center gap-2 text-sm text-[#3A3A3E]">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="h-4 w-4 rounded border-[#D3D0CA]"
        />
        Remember Me
      </label>

      <FieldError message={formError ?? undefined} />

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 h-12 w-full rounded-[4px] bg-[#111114] text-sm font-semibold text-white transition-colors hover:bg-[#C8102E] disabled:cursor-not-allowed disabled:bg-[#C9C9C9] disabled:text-[#8A8A8A]"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>

      <div className="mt-4 flex items-center justify-between text-sm">
        <button type="button" className="text-[#111114] underline-offset-2 hover:underline">
          Lost Your Password?
        </button>
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="text-[#111114] underline-offset-2 hover:underline"
        >
          Create Account
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
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    const result = await signupAction(parsed.data);
    setIsSubmitting(false);
    if (!result.success) {
      setFormError(result.error);
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
    <form onSubmit={handleSubmit} className="w-full max-w-sm">
      <h1 className="mb-6 font-serif text-2xl font-semibold text-[#111114] md:text-3xl">
        Create your account
      </h1>

      {successMessage ? (
        <p
          className={
            successIsWarning
              ? "rounded-[4px] border border-[#B8860B] bg-[#B8860B0f] px-4 py-3 text-sm text-[#B8860B]"
              : "rounded-[4px] border border-[#1E8E5A] bg-[#1E8E5A0f] px-4 py-3 text-sm text-[#1E8E5A]"
          }
        >
          {successMessage}
        </p>
      ) : (
        <>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 w-full rounded-[4px] border border-[#D3D0CA] px-4 text-[#111114] placeholder:text-[#7B7A7F] focus:border-[#111114] focus:outline-none focus:ring-[3px] focus:ring-[#11111414]"
            />
            <FieldError message={errors.name} />
          </div>

          <div className="mb-4">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 w-full rounded-[4px] border border-[#D3D0CA] px-4 text-[#111114] placeholder:text-[#7B7A7F] focus:border-[#111114] focus:outline-none focus:ring-[3px] focus:ring-[#11111414]"
            />
            <FieldError message={errors.email} />
          </div>

          <div className="mb-4">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 w-full rounded-[4px] border border-[#D3D0CA] px-4 text-[#111114] placeholder:text-[#7B7A7F] focus:border-[#111114] focus:outline-none focus:ring-[3px] focus:ring-[#11111414]"
            />
            <FieldError message={errors.password} />
          </div>

          <div className="mb-4">
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-12 w-full rounded-[4px] border border-[#D3D0CA] px-4 text-[#111114] placeholder:text-[#7B7A7F] focus:border-[#111114] focus:outline-none focus:ring-[3px] focus:ring-[#11111414]"
            />
            <FieldError message={errors.confirmPassword} />
          </div>

          <fieldset className="mb-6">
            <legend className="mb-2 text-sm font-medium text-[#3A3A3E]">I am a...</legend>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  checked={role === "reader"}
                  onChange={() => setRole("reader")}
                />
                Reader
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  checked={role === "author"}
                  onChange={() => setRole("author")}
                />
                Author
              </label>
            </div>
          </fieldset>

          <FieldError message={formError ?? undefined} />

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full rounded-[4px] bg-[#111114] text-sm font-semibold text-white transition-colors hover:bg-[#C8102E] disabled:cursor-not-allowed disabled:bg-[#C9C9C9] disabled:text-[#8A8A8A]"
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>

          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-[#111114] underline-offset-2 hover:underline"
            >
              Already have an account? Sign in
            </button>
          </div>
        </>
      )}
    </form>
  );
}
