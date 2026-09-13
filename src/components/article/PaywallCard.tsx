"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { useSession } from "next-auth/react";
import { useAuthModal } from "@/hooks/use-auth-modal";
import { SubscribeButton } from "@/components/billing/SubscribeButton";
import { MagneticButton } from "@/components/shared/MagneticButton";

interface PaywallCardProps {
  articleId: string;
  priceCents: number;
  publicationId?: string | null;
  publicationName?: string | null;
  activePublicationSubName?: string | null;
}

export function PaywallCard({
  articleId,
  priceCents,
  publicationId,
  publicationName,
  activePublicationSubName,
}: PaywallCardProps) {
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
        <Lock className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="mt-4 font-serif text-xl font-semibold text-text-heading">This is a Premium article</h3>
      <p className="mt-1 text-sm text-text-muted">Unlock the full story with one of the options below.</p>

      {error && <p role="alert" className="mt-3 text-sm text-error">{error}</p>}

      <div className="mt-6 flex w-full max-w-xs flex-col gap-3">
        <MagneticButton
          type="button"
          onClick={handleBuy}
          disabled={isSubmitting}
          className="h-11 rounded-[4px] bg-ink text-sm font-semibold text-white transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Redirecting to checkout..." : `Buy this article — $${(priceCents / 100).toFixed(2)}`}
        </MagneticButton>
        {publicationId && (
          <SubscribeButton
            type="publication"
            interval="monthly"
            publicationId={publicationId}
            label={`Subscribe to ${publicationName ?? "this Publication"}`}
            className="h-11 rounded-[4px] border border-border-strong text-sm font-semibold text-text-body transition-colors hover:bg-bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          />
        )}
        <SubscribeButton
          type="platform"
          interval="monthly"
          label="Subscribe to the Platform"
          confirmMessage={
            activePublicationSubName
              ? `You have an active subscription to ${activePublicationSubName}. Subscribing to the Platform will cancel that subscription and replace it with full platform-wide access. Continue?`
              : undefined
          }
          className="h-11 rounded-[4px] border border-border-strong text-sm font-semibold text-text-body transition-colors hover:bg-bg-muted disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>
    </div>
  );
}
