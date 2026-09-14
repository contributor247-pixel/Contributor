"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelSubscriptionAction } from "@/lib/actions/subscription";
import { useConfirm } from "@/hooks/use-confirm";

export function CancelSubscriptionButton({ subscriptionId }: { subscriptionId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const confirm = useConfirm();

  const handleCancel = async () => {
    const confirmed = await confirm({
      title: "Cancel this subscription?",
      message: "You'll lose access at the end of the current billing period.",
      confirmLabel: "Cancel subscription",
      cancelLabel: "Keep subscription",
    });
    if (!confirmed) return;
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
      {error && <span role="alert" className="ml-2 text-xs text-error">{error}</span>}
    </span>
  );
}
