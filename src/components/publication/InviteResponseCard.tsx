"use client";

import { useState } from "react";
import { respondToInviteAction, type PendingInvite } from "@/lib/actions/publication";

export function InviteResponseCard({ invite, onResponded }: { invite: PendingInvite; onResponded: (id: string) => void }) {
  const [isSubmitting, setIsSubmitting] = useState<"accepted" | "declined" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRespond = async (response: "accepted" | "declined") => {
    setError(null);
    setIsSubmitting(response);
    const result = await respondToInviteAction(invite.id, response);
    setIsSubmitting(null);
    if (!result.success) {
      setError(result.error);
      return;
    }
    onResponded(invite.id);
  };

  return (
    <div className="rounded-[4px] border border-border-strong p-4">
      <p className="font-medium text-text-heading">{invite.publicationName}</p>
      {invite.publicationDescription && <p className="mt-1 text-sm text-text-muted">{invite.publicationDescription}</p>}
      <p className="mt-1 text-xs text-text-muted">Invited by {invite.ownerName ?? "Unknown"}</p>
      {error && <p role="alert" className="mt-2 text-sm text-error">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => handleRespond("accepted")}
          disabled={isSubmitting !== null}
          className="h-9 rounded-[4px] bg-ink px-4 text-sm font-semibold text-white transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting === "accepted" ? "Accepting..." : "Accept"}
        </button>
        <button
          type="button"
          onClick={() => handleRespond("declined")}
          disabled={isSubmitting !== null}
          className="h-9 rounded-[4px] border border-border-strong px-4 text-sm font-medium text-text-body transition-colors hover:bg-bg-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting === "declined" ? "Declining..." : "Decline"}
        </button>
      </div>
    </div>
  );
}
