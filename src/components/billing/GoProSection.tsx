"use client";

import { useState } from "react";

interface GoProSectionProps {
  monthlyCents: number;
  yearlyCents: number;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function GoProSection({ monthlyCents, yearlyCents }: GoProSectionProps) {
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/checkout/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
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
    <div className="rounded-[4px] border border-border-strong p-8">
      <h2 className="font-serif text-2xl font-semibold text-text-heading">Go AuthorPro</h2>
      <p className="mt-2 max-w-lg text-text-muted">
        Unlock Premium articles, pricing your own work, and creating Publications with contributors.
      </p>

      <div className="mt-6 inline-flex rounded-[4px] border border-border-strong p-1">
        <button
          type="button"
          onClick={() => setInterval("monthly")}
          className={
            interval === "monthly"
              ? "rounded-[4px] bg-ink px-4 py-2 text-sm font-semibold text-white"
              : "px-4 py-2 text-sm font-medium text-text-body"
          }
        >
          Monthly — {formatCents(monthlyCents)}/mo
        </button>
        <button
          type="button"
          onClick={() => setInterval("yearly")}
          className={
            interval === "yearly"
              ? "rounded-[4px] bg-ink px-4 py-2 text-sm font-semibold text-white"
              : "px-4 py-2 text-sm font-medium text-text-body"
          }
        >
          Yearly — {formatCents(yearlyCents)}/yr
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-error">{error}</p>}

      <button
        type="button"
        onClick={handleUpgrade}
        disabled={isSubmitting}
        className="mt-6 flex h-11 items-center rounded-[4px] bg-ink px-6 text-sm font-semibold text-white transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Redirecting to checkout..." : "Go Pro"}
      </button>
    </div>
  );
}
