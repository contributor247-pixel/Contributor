"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { MagneticButton } from "@/components/shared/MagneticButton";

interface GoProSectionProps {
  monthlyCents: number;
  yearlyCents: number;
}

const FEATURES = [
  "Mark your articles Premium and set your own price",
  "Create Publications and invite contributors",
  "Keep 80% of revenue on standalone Premium articles",
];

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function GoProSection({ monthlyCents, yearlyCents }: GoProSectionProps) {
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const monthlyEquivalentOfYearly = yearlyCents / 12;
  const savingsPct = Math.round((1 - monthlyEquivalentOfYearly / monthlyCents) * 100);

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
    <div className="overflow-hidden rounded-[4px] border border-border-strong">
      <div data-dark-surface className="bg-ink px-8 py-8 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-subtle">AuthorPro</p>
        <h2 className="mt-2 font-serif text-2xl font-semibold">Write premium stories, earn from your work</h2>

        <div className="mt-6 flex items-baseline gap-1">
          <span className="font-serif text-4xl font-semibold">
            {formatCents(interval === "monthly" ? monthlyCents : yearlyCents)}
          </span>
          <span className="text-sm text-white/60">/ {interval === "monthly" ? "month" : "year"}</span>
        </div>

        <div className="mt-5 inline-flex rounded-[4px] border border-white/20 bg-white/5 p-1">
          <button
            type="button"
            onClick={() => setInterval("monthly")}
            className={
              interval === "monthly"
                ? "rounded-[4px] bg-white px-4 py-2 text-sm font-semibold text-ink"
                : "px-4 py-2 text-sm font-medium text-white/70"
            }
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setInterval("yearly")}
            className={
              interval === "yearly"
                ? "flex items-center gap-1.5 rounded-[4px] bg-white px-4 py-2 text-sm font-semibold text-ink"
                : "flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white/70"
            }
          >
            Yearly
            {savingsPct > 0 && (
              <span className="rounded-full bg-success/15 px-1.5 py-0.5 text-[10px] font-semibold text-success">
                Save {savingsPct}%
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="p-8">
        <ul className="flex flex-col gap-3">
          {FEATURES.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-sm text-text-body">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
              {feature}
            </li>
          ))}
        </ul>

        {error && <p className="mt-4 text-sm text-error">{error}</p>}

        <MagneticButton
          type="button"
          onClick={handleUpgrade}
          disabled={isSubmitting}
          className="mt-6 flex h-12 w-full items-center justify-center rounded-[4px] bg-ink text-sm font-semibold text-white transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Redirecting to checkout..." : "Go Pro"}
        </MagneticButton>
      </div>
    </div>
  );
}
