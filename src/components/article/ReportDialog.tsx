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
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Something went wrong. Please try again.");
        return;
      }
      setIsOpen(false);
      setDetail("");
      setReason("spam");
      show("Thanks, we'll review this.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleTriggerClick}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border/70 bg-surface px-3.5 py-1.5 text-xs font-medium text-text-muted transition-colors hover:border-error/40 hover:text-error hover:bg-error/5"
      >
        <Flag className="h-3.5 w-3.5" />
        <span>Report dispatch</span>
      </button>

      <DialogPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-[rgba(10,10,12,0.72)] backdrop-blur-xs" />
          <DialogPrimitive.Popup className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border/80 bg-surface p-6 shadow-2xl outline-none">
            <DialogPrimitive.Title className="font-serif text-xl font-semibold text-text-heading">
              Report this article
            </DialogPrimitive.Title>
            <p className="mt-1 text-xs text-text-muted">
              Help our editorial moderators maintain community standards and accuracy.
            </p>
            <DialogPrimitive.Close
              aria-label="Close"
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg-muted"
            >
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>

            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-muted">Reason</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as typeof reason)}
                  className="h-10 w-full rounded-xl border border-border/80 bg-bg px-3 text-sm text-text-body outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {REASONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Additional details (optional)
                </label>
                <textarea
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-border/80 bg-bg p-3 text-sm text-text-body placeholder:text-text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-y"
                  placeholder="Provide any context that will help our review..."
                />
              </div>
              {error && <p role="alert" className="text-xs text-error">{error}</p>}
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-11 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-white shadow-xs transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Submitting report..." : "Submit report"}
              </button>
            </form>
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
