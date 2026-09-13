"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { updatePlatformConfigAction, type FeeConfigInput } from "@/lib/actions/admin";

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

const DOLLAR_FIELDS: { key: keyof FeeConfigInput; label: string }[] = [
  { key: "authorProMonthlyCents", label: "AuthorPro — Monthly" },
  { key: "authorProYearlyCents", label: "AuthorPro — Yearly" },
  { key: "publicationSubMonthlyCents", label: "Publication Subscription — Monthly" },
  { key: "publicationSubYearlyCents", label: "Publication Subscription — Yearly" },
  { key: "platformSubMonthlyCents", label: "Platform Subscription — Monthly" },
  { key: "platformSubYearlyCents", label: "Platform Subscription — Yearly" },
  { key: "payPerArticleMinCents", label: "Pay-Per-Article — Minimum" },
  { key: "payPerArticleMaxCents", label: "Pay-Per-Article — Maximum" },
];

export function FeeConfigForm({ config }: FeeConfigFormProps) {
  const [values, setValues] = useState<FeeConfigInput>(config);
  const [dollarInputs, setDollarInputs] = useState<Record<string, string>>(
    Object.fromEntries(DOLLAR_FIELDS.map((f) => [f.key, centsToDollarsStr(config[f.key])]))
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const standaloneTotal = values.standaloneAuthorSplitPct + values.standalonePlatformSplitPct;
  const inPubTotal =
    values.inPublicationAuthorSplitPct + values.inPublicationOwnerSplitPct + values.inPublicationPlatformSplitPct;

  const standaloneBalanced = standaloneTotal === 100;
  const inPubBalanced = inPubTotal === 100;

  const canSubmit = useMemo(
    () => standaloneBalanced && inPubBalanced && !isPending,
    [standaloneBalanced, inPubBalanced, isPending]
  );

  const handlePctChange = (key: keyof FeeConfigInput, raw: string) => {
    const num = Math.max(0, Math.min(100, Number(raw) || 0));
    setValues((prev) => ({ ...prev, [key]: num }));
    setSuccess(false);
  };

  const handleDollarChange = (key: keyof FeeConfigInput, raw: string) => {
    setDollarInputs((prev) => ({ ...prev, [key]: raw }));
    setValues((prev) => ({ ...prev, [key]: dollarsStrToCents(raw) }));
    setSuccess(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await updatePlatformConfigAction(values);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6 rounded-[4px] border border-primary-subtle bg-primary-subtle/40 p-4 text-sm text-text-body">
        Changes here apply to <strong>future transactions only</strong> — they never retroactively modify existing
        ledger entries or currently active subscriptions.
      </div>

      <section className="mb-8">
        <h2 className="mb-4 font-serif text-lg font-semibold text-text-heading">Subscription &amp; Purchase Prices</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {DOLLAR_FIELDS.map((field) => (
            <div key={field.key}>
              <label className="mb-1 block text-sm font-medium text-text-body">{field.label}</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-text-muted">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={dollarInputs[field.key]}
                  onChange={(e) => handleDollarChange(field.key, e.target.value)}
                  className="h-11 w-full rounded-[4px] border border-border-strong pl-7 pr-3 text-sm text-text-heading focus:border-ink focus:outline-none focus:ring-[3px] focus:ring-[#14141a14]"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-serif text-lg font-semibold text-text-heading">Standalone Article Revenue Split</h2>
          <span
            className={
              standaloneBalanced
                ? "flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-success"
                : "flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-error"
            }
          >
            {standaloneBalanced ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
            {standaloneTotal}% of 100%
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-text-body">Author %</label>
            <input
              type="number"
              min="0"
              max="100"
              value={values.standaloneAuthorSplitPct}
              onChange={(e) => handlePctChange("standaloneAuthorSplitPct", e.target.value)}
              className="h-11 w-full rounded-[4px] border border-border-strong px-3 text-sm text-text-heading focus:border-ink focus:outline-none focus:ring-[3px] focus:ring-[#14141a14]"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-text-body">Platform %</label>
            <input
              type="number"
              min="0"
              max="100"
              value={values.standalonePlatformSplitPct}
              onChange={(e) => handlePctChange("standalonePlatformSplitPct", e.target.value)}
              className="h-11 w-full rounded-[4px] border border-border-strong px-3 text-sm text-text-heading focus:border-ink focus:outline-none focus:ring-[3px] focus:ring-[#14141a14]"
            />
          </div>
        </div>
        {!standaloneBalanced && (
          <p className="mt-2 text-xs text-error">Author % + Platform % must add up to exactly 100.</p>
        )}
      </section>

      <section className="mb-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-serif text-lg font-semibold text-text-heading">In-Publication Article Revenue Split</h2>
          <span
            className={
              inPubBalanced
                ? "flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-success"
                : "flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-error"
            }
          >
            {inPubBalanced ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
            {inPubTotal}% of 100%
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-text-body">Author %</label>
            <input
              type="number"
              min="0"
              max="100"
              value={values.inPublicationAuthorSplitPct}
              onChange={(e) => handlePctChange("inPublicationAuthorSplitPct", e.target.value)}
              className="h-11 w-full rounded-[4px] border border-border-strong px-3 text-sm text-text-heading focus:border-ink focus:outline-none focus:ring-[3px] focus:ring-[#14141a14]"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-text-body">Publication Owner %</label>
            <input
              type="number"
              min="0"
              max="100"
              value={values.inPublicationOwnerSplitPct}
              onChange={(e) => handlePctChange("inPublicationOwnerSplitPct", e.target.value)}
              className="h-11 w-full rounded-[4px] border border-border-strong px-3 text-sm text-text-heading focus:border-ink focus:outline-none focus:ring-[3px] focus:ring-[#14141a14]"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-text-body">Platform %</label>
            <input
              type="number"
              min="0"
              max="100"
              value={values.inPublicationPlatformSplitPct}
              onChange={(e) => handlePctChange("inPublicationPlatformSplitPct", e.target.value)}
              className="h-11 w-full rounded-[4px] border border-border-strong px-3 text-sm text-text-heading focus:border-ink focus:outline-none focus:ring-[3px] focus:ring-[#14141a14]"
            />
          </div>
        </div>
        {!inPubBalanced && (
          <p className="mt-2 text-xs text-error">Author % + Owner % + Platform % must add up to exactly 100.</p>
        )}
      </section>

      {error && <p role="alert" className="mb-4 text-sm text-error">{error}</p>}
      {success && <p role="status" className="mb-4 text-sm text-success">Fee configuration saved.</p>}

      <button
        type="submit"
        disabled={!canSubmit}
        className="h-11 rounded-[4px] bg-ink px-6 text-sm font-semibold text-white transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
