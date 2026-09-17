import { requireVerifiedAuthorForPage } from "@/lib/require-page-auth";
import { getAuthorProSubscription, getPlatformConfig } from "@/lib/queries/subscriptions";
import { GoProSection } from "@/components/billing/GoProSection";
import { DollarSign, Sparkles, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";

interface BillingPageProps {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const session = await requireVerifiedAuthorForPage();
  const { success, canceled } = await searchParams;

  const subscription = await getAuthorProSubscription(session!.user.id);
  const config = await getPlatformConfig();

  const isActive =
    subscription?.status === "active" && subscription.currentPeriodEnd.getTime() > Date.now();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* 1. Header */}
      <div className="border-b border-border/80 pb-5">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          <DollarSign className="h-3.5 w-3.5" />
          <span>Earnings &amp; Subscription</span>
        </div>
        <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-text-heading">
          Author Billing &amp; Pro
        </h1>
        <p className="mt-0.5 text-xs text-text-muted">
          Manage your AuthorPro membership, payouts, and monetization tools.
        </p>
      </div>

      {/* 2. Alerts */}
      {success === "true" && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-medium text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Payment successful — your AuthorPro membership is now fully active!</span>
        </div>
      )}
      {canceled === "true" && (
        <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-surface-muted p-4 text-xs text-text-muted">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Checkout was canceled. No charges were made to your account.</span>
        </div>
      )}

      {/* 3. AuthorPro Status Card */}
      <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs sm:p-8">
        <div className="flex items-center justify-between border-b border-border/70 pb-4">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-serif text-lg font-semibold text-text-heading">
              AuthorPro Membership
            </h3>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              isActive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : subscription?.status === "cancelled"
                  ? "bg-surface-muted text-text-muted"
                  : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
            }`}
          >
            {isActive && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
            <span>{isActive ? "Pro Active" : subscription?.status ?? "Standard Author"}</span>
          </span>
        </div>

        <div className="mt-4 space-y-2 text-xs text-text-muted">
          {isActive ? (
            <>
              <p className="text-sm text-text-heading font-medium">
                {subscription!.billingInterval === "monthly" ? "Monthly" : "Yearly"} Plan
              </p>
              <p>Renews on <strong>{formatDate(subscription!.currentPeriodEnd)}</strong>.</p>
              <p className="pt-2 text-text-muted">
                ✓ Unlimited paid article monetization &bull; Custom publication mastheads &bull; {config?.standaloneAuthorSplitPct ?? 80}% direct split.
              </p>
            </>
          ) : (
            <p>
              Upgrade to AuthorPro to set single-dispatch paywalls, build collective publications, and receive pooled subscription earnings.
            </p>
          )}
        </div>
      </div>

      {/* 4. Upgrade Section (if not active) */}
      {!isActive && config && (
        <div className="rounded-3xl border border-border/80 bg-surface p-6 shadow-xs sm:p-8">
          <GoProSection
            monthlyCents={config.authorProMonthlyCents}
            yearlyCents={config.authorProYearlyCents}
          />
        </div>
      )}
    </div>
  );
}
