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

export default async function ReaderSubscriptionsPage() {
  await requireAuthForPage();
  const [subscriptions, config] = await Promise.all([getMyReaderSubscriptionsAction(), getPlatformConfig()]);

  const activePublicationSub = subscriptions.find((s) => s.type === "publication" && s.status === "active");
  const activePlatformSub = subscriptions.find((s) => s.type === "platform" && s.status === "active");

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 font-serif text-2xl font-semibold text-text-heading">Subscriptions</h1>

      {subscriptions.length === 0 ? (
        <p className="text-sm text-text-muted">You don&apos;t have any subscriptions yet.</p>
      ) : (
        <ul className="mb-8 flex flex-col gap-3">
          {subscriptions.map((s) => (
            <li key={s.id} className="rounded-[4px] border border-border-strong p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-text-heading">
                    {s.type === "platform" ? "Platform Subscription" : s.publicationName ?? "Publication Subscription"}
                  </p>
                  <p className="text-xs text-text-muted">
                    {STATUS_LABEL[s.status] ?? s.status} · {s.billingInterval} · renews {formatDate(s.currentPeriodEnd)}
                  </p>
                </div>
                {s.status === "active" && <CancelSubscriptionButton subscriptionId={s.id} />}
              </div>
            </li>
          ))}
        </ul>
      )}

      {!activePlatformSub && config && (
        <div className="rounded-[4px] border border-border-strong p-6">
          <h2 className="font-serif text-lg font-semibold text-text-heading">Subscribe to the Platform</h2>
          <p className="mt-1 text-sm text-text-muted">
            Unlimited access to every Premium article platform-wide, {formatCents(config.platformSubMonthlyCents)}/month
            or {formatCents(config.platformSubYearlyCents)}/year.
          </p>
          <div className="mt-4 flex gap-3">
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
              className="h-11 flex-1 rounded-[4px] border border-ink text-sm font-semibold text-ink transition-colors hover:bg-bg-muted disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </div>
      )}
    </div>
  );
}
