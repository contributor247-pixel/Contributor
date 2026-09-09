import { Crown, Newspaper } from "lucide-react";
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
  active: "Active",
  cancelled: "Cancelled",
  superseded: "Superseded by Platform subscription",
  past_due: "Past Due",
};

const STATUS_STYLE: Record<string, string> = {
  active: "bg-success/10 text-success",
  cancelled: "bg-bg-muted text-text-muted",
  superseded: "bg-primary-subtle text-primary",
  past_due: "bg-warning/10 text-warning",
};

export default async function ReaderSubscriptionsPage() {
  await requireAuthForPage();
  const [subscriptions, config] = await Promise.all([getMyReaderSubscriptionsAction(), getPlatformConfig()]);

  const activePublicationSub = subscriptions.find((s) => s.type === "publication" && s.status === "active");
  const activePlatformSub = subscriptions.find((s) => s.type === "platform" && s.status === "active");

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 font-serif text-2xl font-semibold text-text-heading">Subscriptions</h1>
      <p className="mb-6 text-sm text-text-muted">Manage your Publication and Platform access.</p>

      {subscriptions.length === 0 ? (
        <div className="mb-8 flex flex-col items-center justify-center rounded-[4px] border border-dashed border-border-strong px-6 py-12 text-center">
          <Newspaper className="mb-3 h-8 w-8 text-text-muted" aria-hidden="true" />
          <p className="text-sm font-medium text-text-heading">No subscriptions yet</p>
          <p className="mt-1 text-sm text-text-muted">Subscribe to a Publication or the Platform to unlock Premium articles.</p>
        </div>
      ) : (
        <ul className="mb-8 flex flex-col gap-3">
          {subscriptions.map((s) => (
            <li key={s.id} className="rounded-[4px] border border-border-strong p-4 transition-colors hover:border-ink/20">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-white">
                    {s.type === "platform" ? (
                      <Crown className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Newspaper className="h-4 w-4" aria-hidden="true" />
                    )}
                  </span>
                  <div>
                    <p className="font-medium text-text-heading">
                      {s.type === "platform" ? "Platform Subscription" : s.publicationName ?? "Publication Subscription"}
                    </p>
                    <p className="mt-0.5 text-xs text-text-muted">
                      {s.billingInterval} · renews {formatDate(s.currentPeriodEnd)}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${STATUS_STYLE[s.status] ?? "bg-bg-muted text-text-muted"}`}
                  >
                    {STATUS_LABEL[s.status] ?? s.status}
                  </span>
                  {s.status === "active" && <CancelSubscriptionButton subscriptionId={s.id} />}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!activePlatformSub && config && (
        <div className="overflow-hidden rounded-[4px] border border-border-strong">
          <div className="bg-ink px-6 py-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-subtle">Platform Access</p>
            <h2 className="mt-2 font-serif text-xl font-semibold">Unlimited Premium, platform-wide</h2>
            <p className="mt-1.5 text-sm text-white/70">
              Read every Premium article on Contributor, from every Author and Publication — no per-article purchases.
            </p>
          </div>
          <div className="flex gap-3 p-6">
            <SubscribeButton
              type="platform"
              interval="monthly"
              label={`Monthly — ${formatCents(config.platformSubMonthlyCents)}`}
              confirmMessage={
                activePublicationSub
                  ? `You have an active subscription to ${activePublicationSub.publicationName ?? "a Publication"}. Subscribing to the Platform will cancel that subscription and replace it with full platform-wide access. Continue?`
                  : undefined
              }
              className="h-11 flex-1 rounded-[4px] bg-ink text-sm font-semibold text-white transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
            />
            <SubscribeButton
              type="platform"
              interval="yearly"
              label={`Yearly — ${formatCents(config.platformSubYearlyCents)}`}
              confirmMessage={
                activePublicationSub
                  ? `You have an active subscription to ${activePublicationSub.publicationName ?? "a Publication"}. Subscribing to the Platform will cancel that subscription and replace it with full platform-wide access. Continue?`
                  : undefined
              }
              className="h-11 flex-1 rounded-[4px] border border-border-strong text-sm font-semibold text-text-heading transition-colors hover:bg-bg-muted disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </div>
      )}
    </div>
  );
}
