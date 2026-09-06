"use client";

import { useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Flag, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useAuthModal } from "@/hooks/use-auth-modal";
import { useToast } from "@/hooks/use-toast";

const REASONS = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Harassment" },
  { value: "copyright", label: "Copyright violation" },
  { value: "misinformation", label: "Misinformation" },
  { value: "other", label: "Other" },
] as const;

export function ReportDialog({ articleId }: { articleId: string }) {
  const { data: session } = useSession();
  const { open: openAuthModal } = useAuthModal();
  const { show } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<(typeof REASONS)[number]["value"]>("spam");
  const [detail, setDetail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTriggerClick = () => {
    if (!session?.user) {
      openAuthModal("login");
      return;
    }
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, reason, detail: detail.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setIsOpen(false);
      setDetail("");
      setReason("spam");
      show("Thanks, we'll review this.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleTriggerClick}
        className="flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-error"
      >
        <Flag className="h-4 w-4" />
        Report this article
      </button>

      <DialogPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-[rgba(10,10,12,0.72)]" />
          <DialogPrimitive.Popup className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow-2xl outline-none">
            <DialogPrimitive.Title className="font-serif text-lg font-semibold text-text-heading">
              Report this article
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              aria-label="Close"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg-muted"
            >
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>

            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-text-body">Reason</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as typeof reason)}
                  className="h-11 w-full rounded-[4px] border border-border-strong px-3 text-sm text-text-body focus:border-ink focus:outline-none focus:ring-[3px] focus:ring-[#11111414]"
                >
                  {REASONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text-body">
                  Additional details (optional)
                </label>
                <textarea
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  rows={3}
                  className="w-full rounded-[4px] border border-border-strong px-3 py-2 text-sm text-text-body placeholder:text-text-muted focus:border-ink focus:outline-none focus:ring-[3px] focus:ring-[#11111414]"
                />
              </div>
              {error && <p className="text-sm text-error">{error}</p>}
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-11 rounded-[4px] bg-ink text-sm font-semibold text-white transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Submitting..." : "Submit report"}
              </button>
            </form>
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
