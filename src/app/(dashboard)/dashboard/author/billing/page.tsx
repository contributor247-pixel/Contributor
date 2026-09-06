import { requireVerifiedAuthorForPage } from "@/lib/require-page-auth";
import { getAuthorProSubscription, getPlatformConfig } from "@/lib/queries/subscriptions";
import { GoProSection } from "@/components/billing/GoProSection";

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
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 font-serif text-2xl font-semibold text-text-heading">Billing</h1>

      {success === "true" && (
        <div className="mb-6 rounded-[4px] bg-success/10 px-4 py-3 text-sm text-success">
          Payment successful — your AuthorPro subscription is being activated.
        </div>
      )}
      {canceled === "true" && (
        <div className="mb-6 rounded-[4px] bg-bg-muted px-4 py-3 text-sm text-text-muted">
          Checkout was canceled. No charge was made.
        </div>
      )}

      <div className="mb-6 rounded-[4px] border border-border-strong p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">AuthorPro Status</p>
        {isActive ? (
          <>
            <p className="mt-2 text-lg font-semibold text-success">AuthorPro Active</p>
            <p className="mt-1 text-sm text-text-muted">
              {subscription!.billingInterval === "monthly" ? "Monthly" : "Yearly"} plan, renews{" "}
              {formatDate(subscription!.currentPeriodEnd)}.
            </p>
          </>
        ) : subscription?.status === "cancelled" ? (
          <p className="mt-2 text-lg font-semibold text-text-body">Cancelled</p>
        ) : subscription?.status === "past_due" ? (
          <p className="mt-2 text-lg font-semibold text-error">Past Due</p>
        ) : (
          <p className="mt-2 text-lg font-semibold text-text-body">Not subscribed</p>
        )}
      </div>

      {!isActive && config && (
        <GoProSection monthlyCents={config.authorProMonthlyCents} yearlyCents={config.authorProYearlyCents} />
      )}
    </div>
  );
}
