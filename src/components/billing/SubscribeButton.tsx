"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useAuthModal } from "@/hooks/use-auth-modal";
import { useConfirm } from "@/hooks/use-confirm";

interface SubscribeButtonProps {
  type: "publication" | "platform";
  interval: "monthly" | "yearly";
  publicationId?: string;
  label: string;
  className?: string;
  confirmMessage?: string;
}

export function SubscribeButton({ type, interval, publicationId, label, className, confirmMessage }: SubscribeButtonProps) {
  const { data: session } = useSession();
  const { open } = useAuthModal();
  const confirm = useConfirm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    if (!session?.user) {
      open("login");
      return;
    }
    // Not destructive — this is a plan-change heads-up (e.g. switching
    // from a Publication sub to the Platform sub), not a delete/cancel.
    if (confirmMessage && !(await confirm({ message: confirmMessage, confirmLabel: "Continue", destructive: false }))) return;

    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/checkout/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, interval, publicationId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setIsSubmitting(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleSubscribe}
        disabled={isSubmitting}
        className={className ?? "h-11 rounded-[4px] border border-border-strong text-sm font-semibold text-text-body transition-colors hover:bg-bg-muted disabled:cursor-not-allowed disabled:opacity-60"}
      >
        {isSubmitting ? "Redirecting to checkout..." : label}
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-error">{error}</p>}
    </div>
  );
}
