"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  DollarSign,
  Percent,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { updatePlatformConfigAction, type FeeConfigInput } from "@/lib/actions/admin";
import { useToast } from "@/hooks/use-toast";

interface FeeConfigFormProps {
  config: FeeConfigInput;
}

function centsToDollarsStr(cents: number): string {
  return (cents / 100).toFixed(2);
}
function dollarsStrToCents(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
}

const SUBSCRIPTION_FIELDS: {
  key: keyof FeeConfigInput;
  label: string;
  category: string;
  description: string;
}[] = [
  {
    key: "authorProMonthlyCents",
    label: "AuthorPro Monthly",
    category: "Author Subscription",
    description: "Monthly subscription fee for professional author studio tooling.",
  },
  {
    key: "authorProYearlyCents",
    label: "AuthorPro Yearly",
    category: "Author Subscription",
    description: "Discounted annual billing rate for AuthorPro membership.",
  },
  {
    key: "publicationSubMonthlyCents",
    label: "Publication Sub Monthly",
    category: "Reader Publication Access",
    description: "Monthly baseline reader subscription for individual publications.",
  },
  {
    key: "publicationSubYearlyCents",
    label: "Publication Sub Yearly",
    category: "Reader Publication Access",
    description: "Annual baseline reader subscription for individual publications.",
  },
  {
    key: "platformSubMonthlyCents",
    label: "Platform All-Access Monthly",
    category: "Network All-Access",
    description: "Monthly all-access pass across all platform publications.",
  },
  {
    key: "platformSubYearlyCents",
    label: "Platform All-Access Yearly",
    category: "Network All-Access",
    description: "Annual all-access pass across all platform publications.",
  },
];

const PAYWALL_BOUNDS: {
  key: keyof FeeConfigInput;
  label: string;
  description: string;
}[] = [
  {
    key: "payPerArticleMinCents",
    label: "Minimum Article Price",
    description: "Lowest allowable single-article unlock price an author can set.",
  },
  {
    key: "payPerArticleMaxCents",
    label: "Maximum Article Price",
    description: "Ceiling price for an individual pay-per-article purchase.",
  },
  {
    key: "payPerArticleDefaultCents",
    label: "Default Article Price",
    description: "Price a new Premium article's price field is pre-filled with, before the Author changes it.",
  },
];

export function FeeConfigForm({ config }: FeeConfigFormProps) {
  const [values, setValues] = useState<FeeConfigInput>(config);
  const [dollarInputs, setDollarInputs] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const item of [...SUBSCRIPTION_FIELDS, ...PAYWALL_BOUNDS]) {
      map[item.key] = centsToDollarsStr(config[item.key]);
    }
    return map;
  });

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { show } = useToast();

  const standaloneTotal = values.standaloneAuthorSplitPct + values.standalonePlatformSplitPct;
  const inPubTotal =
    values.inPublicationAuthorSplitPct +
    values.inPublicationOwnerSplitPct +
    values.inPublicationPlatformSplitPct;

  const standaloneBalanced = standaloneTotal === 100;
  const inPubBalanced = inPubTotal === 100;
  const defaultPriceInRange =
    values.payPerArticleDefaultCents >= values.payPerArticleMinCents &&
    values.payPerArticleDefaultCents <= values.payPerArticleMaxCents;

  const canSubmit = useMemo(
    () => standaloneBalanced && inPubBalanced && defaultPriceInRange && !isPending,
    [standaloneBalanced, inPubBalanced, defaultPriceInRange, isPending]
  );

  const handlePctChange = (key: keyof FeeConfigInput, raw: string) => {
    const num = Math.max(0, Math.min(100, Number(raw) || 0));
    setValues((prev) => ({ ...prev, [key]: num }));
  };

  const handleDollarChange = (key: keyof FeeConfigInput, raw: string) => {
    setDollarInputs((prev) => ({ ...prev, [key]: raw }));
    setValues((prev) => ({ ...prev, [key]: dollarsStrToCents(raw) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updatePlatformConfigAction(values);
      if (!result.success) {
        setError(result.error);
        return;
      }
      show("Platform fee & pricing configuration saved.");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Notice Banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-xs">
        <Info className="h-5 w-5 shrink-0 text-primary mt-0.5" />
        <div className="text-xs leading-relaxed text-text-body">
          <strong className="font-semibold text-text-heading">Financial Settlement Policy:</strong>{" "}
          Changes configured below apply exclusively to <strong>future transactions and subscriptions</strong>.
          Existing ledger records and already active recurring billing intervals will not be modified retroactively.
        </div>
      </div>

      {/* Section 1: Subscriptions Pricing */}
      <div className="rounded-2xl border border-border/80 bg-surface p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 text-primary" />
            <h2 className="font-serif text-xl font-bold text-text-heading">
              Subscription Pricing Rates
            </h2>
          </div>
          <p className="text-xs text-text-muted">
            Configure default billing pricing for creator tools and reader publication memberships.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {SUBSCRIPTION_FIELDS.map((field) => (
            <div
              key={field.key}
              className="flex flex-col justify-between rounded-xl border border-border/60 bg-bg-alt/30 p-4 transition-all focus-within:border-primary/60 focus-within:bg-surface"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label className="text-xs font-semibold text-text-heading">
                    {field.label}
                  </label>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted bg-surface px-2 py-0.5 rounded border border-border/40">
                    {field.category}
                  </span>
                </div>
                <p className="text-[11px] text-text-muted mb-3">
                  {field.description}
                </p>
              </div>

              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-text-muted">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={dollarInputs[field.key]}
                  onChange={(e) => handleDollarChange(field.key, e.target.value)}
                  className="h-10 w-full rounded-lg border border-border/80 bg-surface pl-7 pr-3 text-xs sm:text-sm font-medium text-text-heading shadow-2xs transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Pay-Per-Article Pricing Bounds */}
      <div className="rounded-2xl border border-border/80 bg-surface p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="font-serif text-xl font-bold text-text-heading">
              Pay-Per-Article Paywall Bounds
            </h2>
          </div>
          <p className="text-xs text-text-muted">
            Establish allowable minimum and maximum boundary pricing for single-story unlock purchases.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {PAYWALL_BOUNDS.map((field) => (
            <div
              key={field.key}
              className="flex flex-col justify-between rounded-xl border border-border/60 bg-bg-alt/30 p-4 transition-all focus-within:border-primary/60 focus-within:bg-surface"
            >
              <div>
                <label className="text-xs font-semibold text-text-heading block mb-1">
                  {field.label}
                </label>
                <p className="text-[11px] text-text-muted mb-3">
                  {field.description}
                </p>
              </div>

              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-text-muted">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={dollarInputs[field.key]}
                  onChange={(e) => handleDollarChange(field.key, e.target.value)}
                  className="h-10 w-full rounded-lg border border-border/80 bg-surface pl-7 pr-3 text-xs sm:text-sm font-medium text-text-heading shadow-2xs transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
                />
              </div>
            </div>
          ))}
        </div>

        {!defaultPriceInRange && (
          <p role="alert" className="text-xs font-medium text-error flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            Default Article Price must fall between the minimum and maximum.
          </p>
        )}
      </div>

      {/* Section 3: Standalone Article Revenue Split */}
      <div className="rounded-2xl border border-border/80 bg-surface p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/80 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Percent className="h-4 w-4 text-primary" />
              <h2 className="font-serif text-xl font-bold text-text-heading">
                Standalone Article Revenue Split
              </h2>
            </div>
            <p className="text-xs text-text-muted">
              Division of gross revenue for standalone creator articles not enrolled in a publication.
            </p>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              standaloneBalanced
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
            }`}
          >
            {standaloneBalanced ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
            {standaloneTotal}% / 100% Total
          </span>
        </div>

        {/* Visual Split Gauge Bar */}
        <div className="space-y-2">
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-bg-alt border border-border/60">
            <div
              style={{ width: `${Math.min(100, values.standaloneAuthorSplitPct)}%` }}
              className="bg-primary transition-all duration-300"
              title={`Author: ${values.standaloneAuthorSplitPct}%`}
            />
            <div
              style={{ width: `${Math.min(100, values.standalonePlatformSplitPct)}%` }}
              className="bg-amber-500 transition-all duration-300"
              title={`Platform: ${values.standalonePlatformSplitPct}%`}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Author Share ({values.standaloneAuthorSplitPct}%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Platform Share ({values.standalonePlatformSplitPct}%)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="rounded-xl border border-border/60 bg-bg-alt/30 p-4">
            <label className="text-xs font-semibold text-text-heading block mb-1">
              Author Split %
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={values.standaloneAuthorSplitPct}
                onChange={(e) => handlePctChange("standaloneAuthorSplitPct", e.target.value)}
                className="h-10 w-full rounded-lg border border-border/80 bg-surface pr-8 pl-3 text-xs sm:text-sm font-semibold text-text-heading shadow-2xs transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-text-muted">
                %
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-bg-alt/30 p-4">
            <label className="text-xs font-semibold text-text-heading block mb-1">
              Platform Fee %
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={values.standalonePlatformSplitPct}
                onChange={(e) => handlePctChange("standalonePlatformSplitPct", e.target.value)}
                className="h-10 w-full rounded-lg border border-border/80 bg-surface pr-8 pl-3 text-xs sm:text-sm font-semibold text-text-heading shadow-2xs transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-text-muted">
                %
              </span>
            </div>
          </div>
        </div>

        {!standaloneBalanced && (
          <p role="alert" className="text-xs font-medium text-error flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            Author Split % + Platform Fee % must sum to exactly 100%.
          </p>
        )}
      </div>

      {/* Section 4: In-Publication Article Revenue Split */}
      <div className="rounded-2xl border border-border/80 bg-surface p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/80 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Percent className="h-4 w-4 text-primary" />
              <h2 className="font-serif text-xl font-bold text-text-heading">
                In-Publication Article Revenue Split
              </h2>
            </div>
            <p className="text-xs text-text-muted">
              Three-way revenue division between the author, the publication owner, and the platform.
            </p>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              inPubBalanced
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
            }`}
          >
            {inPubBalanced ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
            {inPubTotal}% / 100% Total
          </span>
        </div>

        {/* Visual Split Gauge Bar (3-way) */}
        <div className="space-y-2">
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-bg-alt border border-border/60">
            <div
              style={{ width: `${Math.min(100, values.inPublicationAuthorSplitPct)}%` }}
              className="bg-primary transition-all duration-300"
              title={`Author: ${values.inPublicationAuthorSplitPct}%`}
            />
            <div
              style={{ width: `${Math.min(100, values.inPublicationOwnerSplitPct)}%` }}
              className="bg-indigo-500 transition-all duration-300"
              title={`Publication: ${values.inPublicationOwnerSplitPct}%`}
            />
            <div
              style={{ width: `${Math.min(100, values.inPublicationPlatformSplitPct)}%` }}
              className="bg-amber-500 transition-all duration-300"
              title={`Platform: ${values.inPublicationPlatformSplitPct}%`}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Author ({values.inPublicationAuthorSplitPct}%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              Publication Owner ({values.inPublicationOwnerSplitPct}%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Platform Fee ({values.inPublicationPlatformSplitPct}%)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="rounded-xl border border-border/60 bg-bg-alt/30 p-4">
            <label className="text-xs font-semibold text-text-heading block mb-1">
              Author %
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={values.inPublicationAuthorSplitPct}
                onChange={(e) => handlePctChange("inPublicationAuthorSplitPct", e.target.value)}
                className="h-10 w-full rounded-lg border border-border/80 bg-surface pr-8 pl-3 text-xs sm:text-sm font-semibold text-text-heading shadow-2xs transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-text-muted">
                %
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-bg-alt/30 p-4">
            <label className="text-xs font-semibold text-text-heading block mb-1">
              Publication Owner %
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={values.inPublicationOwnerSplitPct}
                onChange={(e) => handlePctChange("inPublicationOwnerSplitPct", e.target.value)}
                className="h-10 w-full rounded-lg border border-border/80 bg-surface pr-8 pl-3 text-xs sm:text-sm font-semibold text-text-heading shadow-2xs transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-text-muted">
                %
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-bg-alt/30 p-4">
            <label className="text-xs font-semibold text-text-heading block mb-1">
              Platform Fee %
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={values.inPublicationPlatformSplitPct}
                onChange={(e) => handlePctChange("inPublicationPlatformSplitPct", e.target.value)}
                className="h-10 w-full rounded-lg border border-border/80 bg-surface pr-8 pl-3 text-xs sm:text-sm font-semibold text-text-heading shadow-2xs transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-text-muted">
                %
              </span>
            </div>
          </div>
        </div>

        {!inPubBalanced && (
          <p role="alert" className="text-xs font-medium text-error flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            Author % + Publication Owner % + Platform Fee % must sum to exactly 100%.
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Save Action Footer */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-8 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all hover:bg-primary hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          {isPending ? "Saving Changes..." : "Save Fee Settings"}
        </button>
      </div>
    </form>
  );
}
