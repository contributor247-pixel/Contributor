import { Crown, Newspaper, Sparkles, CheckCircle2, AlertCircle, ShieldCheck, ArrowRight } from "lucide-react";
import { requireAuthForPage } from "@/lib/require-page-auth";
import { getMyReaderSubscriptionsAction } from "@/lib/actions/subscription";
import { getPlatformConfig } from "@/lib/queries/subscriptions";
import { CancelSubscriptionButton } from "@/components/billing/CancelSubscriptionButton";
import { SubscribeButton } from "@/components/billing/SubscribeButton";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

const STATUS_LABEL: Record<string, string> = {
  active: "Active Membership",
  cancelled: "Cancelled",
  superseded: "Superseded by Platform Pass",
  past_due: "Past Due",
};

const STATUS_STYLE: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
  cancelled: "bg-surface-muted text-text-muted border border-border/60",
  superseded: "bg-primary/10 text-primary border border-primary/20",
  past_due: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30",
};

interface ReaderSubscriptionsPageProps {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}

export default async function ReaderSubscriptionsPage({ searchParams }: ReaderSubscriptionsPageProps) {
  await requireAuthForPage();
  const { success, canceled } = await searchParams;
  const [subscriptions, config] = await Promise.all([
    getMyReaderSubscriptionsAction().catch(() => []),
    getPlatformConfig().catch(() => null),
  ]);

  const activePublicationSub = subscriptions.find(
    (s) => s.type === "publication" && s.status === "active"
  );
  const activePlatformSub = subscriptions.find(
    (s) => s.type === "platform" && s.status === "active"
  );

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* 1. Page Header */}
      <div className="border-b border-border/80 pb-5">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Access Passes</span>
        </div>
        <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-text-heading">
          Subscriptions &amp; Memberships
        </h1>
        <p className="mt-0.5 text-xs text-text-muted">
          Manage your active publication subscriptions and platform-wide reading passes.
        </p>
      </div>

      {/* 1b. Checkout Result Alerts */}
      {success === "true" && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-medium text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Payment successful — your subscription is now active!</span>
        </div>
      )}
      {canceled === "true" && (
        <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-surface-muted p-4 text-xs text-text-muted">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Checkout was canceled. No charges were made to your account.</span>
        </div>
      )}

      {/* 2. Active Subscriptions List */}
      {subscriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/90 bg-surface/40 px-6 py-12 text-center">
          <Newspaper className="h-10 w-10 text-text-muted" aria-hidden="true" />
          <h3 className="mt-3 font-serif text-lg font-semibold text-text-heading">
            No Active Subscriptions
          </h3>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-text-muted">
            Subscribe to a publication masthead or activate a Platform Pass to read all premium essays with unlimited access.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {subscriptions.map((s) => (
            <li
              key={s.id}
              className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-hover text-white shadow-xs">
                    {s.type === "platform" ? (
                      <Crown className="h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Newspaper className="h-6 w-6" aria-hidden="true" />
                    )}
                  </span>
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-text-heading">
                      {s.type === "platform"
                        ? "Contributor Platform Pass"
                        : s.publicationName ?? "Publication Subscription"}
                    </h3>
                    <p className="mt-1 text-xs text-text-muted">
                      <span className="capitalize font-medium text-text-body">{s.billingInterval}</span> billing &bull;{" "}
                      {s.status === "active"
                        ? `Renews ${formatDate(s.currentPeriodEnd)}`
                        : s.status === "cancelled"
                          ? `Access ends ${formatDate(s.currentPeriodEnd)}`
                          : `Ended ${formatDate(s.currentPeriodEnd)}`}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                      STATUS_STYLE[s.status] ?? "bg-surface-muted text-text-muted"
                    }`}
                  >
                    {s.status === "active" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                    <span>{STATUS_LABEL[s.status] ?? s.status}</span>
                  </span>
                  {s.status === "active" && (
                    <CancelSubscriptionButton subscriptionId={s.id} />
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* 3. Platform Wide Access Upgrade Card */}
      {!activePlatformSub && config && (
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-ink p-8 text-white shadow-xl sm:p-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_140%_at_50%_0%,rgba(139,30,63,0.35),transparent_65%)]"
          />

          <div className="relative">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-supportive-subtle">
              <Crown className="h-3.5 w-3.5 text-supportive" />
              <span>Full Platform Access</span>
            </div>

            <h2 className="mt-4 font-serif text-2xl font-semibold leading-tight text-white sm:text-3xl">
              Unlimited Premium Dispatches Everywhere
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/75">
              Read every Premium article published across all independent authors and publication mastheads on Contributor. No single purchases, no paywalls.
            </p>

            <div className="mt-8 flex flex-col gap-3.5 sm:flex-row">
              <SubscribeButton
                type="platform"
                interval="monthly"
                label={`Monthly Plan — ${formatCents(config.platformSubMonthlyCents)}/mo`}
                confirmMessage={
                  activePublicationSub
                    ? `You have an active subscription to ${activePublicationSub.publicationName ?? "a Publication"}. Subscribing to the Platform will replace it with full platform-wide access. Continue?`
                    : undefined
                }
                className="h-12 flex-1 rounded-full bg-white px-6 text-sm font-semibold text-ink shadow-md transition-all hover:bg-primary-subtle hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              />
              <SubscribeButton
                type="platform"
                interval="yearly"
                label={`Yearly Plan — ${formatCents(config.platformSubYearlyCents)}/yr`}
                confirmMessage={
                  activePublicationSub
                    ? `You have an active subscription to ${activePublicationSub.publicationName ?? "a Publication"}. Subscribing to the Platform will replace it with full platform-wide access. Continue?`
                    : undefined
                }
                className="h-12 flex-1 rounded-full border border-white/30 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/15 hover:border-white/50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
