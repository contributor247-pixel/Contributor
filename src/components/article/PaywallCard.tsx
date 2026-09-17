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
  hasActivePlatformSub?: boolean;
}

export function PaywallCard({
  articleId,
  priceCents,
  publicationId,
  publicationName,
  activePublicationSubName,
  hasActivePlatformSub,
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
    <div
      data-dark-surface
      className="relative mt-[-100px] flex flex-col items-center rounded-3xl border border-white/15 bg-gradient-to-b from-ink via-ink to-ink-soft p-8 text-center text-white shadow-2xl sm:p-10"
    >
      {/* Ambient gold glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_80%_at_50%_0%,rgba(217,119,6,0.2),transparent_70%),radial-gradient(60%_60%_at_50%_100%,rgba(139,30,63,0.35),transparent_70%)]"
      />

      <span className="relative flex h-14 w-14 items-center justify-center rounded-full border border-supportive/50 bg-supportive/20 text-supportive-subtle shadow-[0_0_20px_rgba(217,119,6,0.25)] backdrop-blur-sm">
        <Lock className="h-6 w-6" aria-hidden="true" />
      </span>

      <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-supportive/50 bg-supportive/20 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-supportive-subtle">
        Premium Edition
      </span>

      <h3 className="mt-3 font-serif text-2xl font-semibold leading-snug text-white sm:text-3xl">
        Unlock the full dispatch
      </h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-white/75">
        Support independent journalism with a single-article unlock or access all creator publications.
      </p>

      {error && <p role="alert" className="mt-3 text-sm text-error">{error}</p>}

      <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
        <MagneticButton
          type="button"
          onClick={handleBuy}
          disabled={isSubmitting}
          className="h-12 rounded-full border border-white/20 bg-white text-sm font-semibold text-ink shadow-lg transition-all duration-200 hover:bg-white/95 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Redirecting to checkout..." : `Unlock this article — $${(priceCents / 100).toFixed(2)}`}
        </MagneticButton>

        {publicationId && (
          <SubscribeButton
            type="publication"
            interval="monthly"
            publicationId={publicationId}
            label={`Subscribe to ${publicationName ?? "this Publication"}`}
            // Reverse direction of the Platform button's warning below:
            // docs/00_ScopeDocument.md Section 6 says subscribing to a
            // Publication while already on a Platform subscription is
            // allowed but redundant (Platform access already includes
            // it) — must not block, but the UI should warn. Purely
            // informational; confirming proceeds with the purchase.
            confirmMessage={
              hasActivePlatformSub
                ? `You already have an active Platform All-Access subscription, which already includes ${publicationName ?? "this Publication"}. Subscribing here would be a redundant additional charge. Continue anyway?`
                : undefined
            }
            className="h-11 rounded-full border border-white/20 bg-white/[0.06] text-xs font-semibold text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          />
        )}

        <SubscribeButton
          type="platform"
          interval="monthly"
          label="Subscribe to Platform All-Access Pass"
          confirmMessage={
            activePublicationSubName
              ? `You have an active subscription to ${activePublicationSubName}. Subscribing to the Platform will cancel that subscription and replace it with full platform-wide access. Continue?`
              : undefined
          }
          className="h-11 rounded-full border border-white/15 bg-white/[0.03] text-xs font-medium text-white/80 backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>
    </div>
  );
}
