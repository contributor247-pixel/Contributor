"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelSubscriptionAction } from "@/lib/actions/subscription";

export function CancelSubscriptionButton({ subscriptionId }: { subscriptionId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleCancel = () => {
    if (!window.confirm("Cancel this subscription? You'll lose access at the end of the current billing period.")) return;
    setError(null);
    startTransition(async () => {
      const result = await cancelSubscriptionAction(subscriptionId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <span>
      <button
        type="button"
        onClick={handleCancel}
        disabled={isPending}
        className="inline-flex min-h-11 items-center px-2 text-sm text-error underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Cancelling..." : "Cancel"}
      </button>
      {error && <span className="ml-2 text-xs text-error">{error}</span>}
    </span>
  );
}
