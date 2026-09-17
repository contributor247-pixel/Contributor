import { Percent, ShieldCheck } from "lucide-react";
import { requireRoleForPage } from "@/lib/require-page-auth";
import { getPlatformConfig } from "@/lib/actions/admin";
import { FeeConfigForm } from "./FeeConfigForm";

export default async function AdminFeesPage() {
  await requireRoleForPage("admin");
  const config = await getPlatformConfig();

  if (!config) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center shadow-xs">
        <h1 className="font-serif text-2xl font-bold text-text-heading">Platform Fee Settings</h1>
        <p className="mt-2 text-sm text-error">
          No platform configuration row found in the database. Please ensure migrations and seed scripts have run.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              FINANCIAL ARCHITECTURE
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-surface border border-border/80 px-2.5 py-0.5 text-xs text-text-muted">
              <ShieldCheck className="h-3.5 w-3.5 text-success" />
              Platform Rules
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-text-heading">
            Fee &amp; Revenue Settings
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Configure system-wide subscriptions, pay-per-article boundaries, and revenue split percentages.
          </p>
        </div>
      </div>

      <FeeConfigForm
        config={{
          authorProMonthlyCents: config.authorProMonthlyCents,
          authorProYearlyCents: config.authorProYearlyCents,
          publicationSubMonthlyCents: config.publicationSubMonthlyCents,
          publicationSubYearlyCents: config.publicationSubYearlyCents,
          platformSubMonthlyCents: config.platformSubMonthlyCents,
          platformSubYearlyCents: config.platformSubYearlyCents,
          payPerArticleMinCents: config.payPerArticleMinCents,
          payPerArticleMaxCents: config.payPerArticleMaxCents,
          payPerArticleDefaultCents: config.payPerArticleDefaultCents,
          standaloneAuthorSplitPct: config.standaloneAuthorSplitPct,
          standalonePlatformSplitPct: config.standalonePlatformSplitPct,
          inPublicationAuthorSplitPct: config.inPublicationAuthorSplitPct,
          inPublicationOwnerSplitPct: config.inPublicationOwnerSplitPct,
          inPublicationPlatformSplitPct: config.inPublicationPlatformSplitPct,
        }}
      />
    </div>
  );
}
