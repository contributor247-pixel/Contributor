"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { useSession } from "next-auth/react";
import { useAuthModal } from "@/hooks/use-auth-modal";

interface PaywallCardProps {
  articleId: string;
  priceCents: number;
}

export function PaywallCard({ articleId, priceCents }: PaywallCardProps) {
  const { data: session } = useSession();
  const { open } = useAuthModal();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBuy = async () => {
    if (!session?.user) {
      open("login");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/checkout/article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
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
    <div className="relative mt-[-100px] flex flex-col items-center rounded-[4px] border border-border-strong bg-white p-8 text-center shadow-lg">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white">
        <Lock className="h-5 w-5" />
      </span>
      <h3 className="mt-4 font-serif text-xl font-semibold text-text-heading">This is a Premium article</h3>
      <p className="mt-1 text-sm text-text-muted">Unlock the full story with one of the options below.</p>

      {error && <p className="mt-3 text-sm text-error">{error}</p>}

      <div className="mt-6 flex w-full max-w-xs flex-col gap-3">
        <button
          type="button"
          onClick={handleBuy}
          disabled={isSubmitting}
          className="h-11 rounded-[4px] bg-ink text-sm font-semibold text-white transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Redirecting to checkout..." : `Buy this article — $${(priceCents / 100).toFixed(2)}`}
        </button>
      </div>
    </div>
  );
}
