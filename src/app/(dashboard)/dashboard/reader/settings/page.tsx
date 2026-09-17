import Link from "next/link";
import { User, Mail, Shield, Sparkles, PenLine, LogOut } from "lucide-react";
import { requireAuthForPage } from "@/lib/require-page-auth";
import { getPlatformConfig } from "@/lib/queries/subscriptions";
import { SignOutButton } from "@/components/dashboard/SignOutButton";

function initials(name: string | null | undefined, email: string | null | undefined): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || parts[0]?.[0]?.toUpperCase() || "?";
  }
  return email?.[0]?.toUpperCase() ?? "?";
}

export default async function ReaderSettingsPage() {
  const session = await requireAuthForPage();
  const config = await getPlatformConfig();
  const authorSplitPct = config?.standaloneAuthorSplitPct ?? 80;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* 1. Page Header */}
      <div className="border-b border-border/80 pb-5">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Preferences</span>
        </div>
        <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-text-heading">
          Account &amp; Settings
        </h1>
        <p className="mt-0.5 text-xs text-text-muted">
          Your personal reader profile and credentials on Contributor.
        </p>
      </div>

      {/* 2. User Profile Card */}
      <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-hover text-lg font-bold text-white shadow-xs">
            {initials(session?.user?.name, session?.user?.email)}
          </span>
          <div>
            <h2 className="font-serif text-xl font-semibold text-text-heading">
              {session?.user?.name ?? "Contributor Reader"}
            </h2>
            <p className="text-xs text-text-muted">{session?.user?.email}</p>
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              <Shield className="h-3 w-3" />
              <span>{session?.user?.role ?? "reader"}</span>
            </span>
          </div>
        </div>

        <div className="mt-8 border-t border-border/70 pt-6">
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
            Profile Details
          </h3>
          <dl className="mt-4 divide-y divide-border/60 text-sm">
            <div className="flex items-center justify-between py-3">
              <dt className="flex items-center gap-2 text-text-muted">
                <User className="h-4 w-4" />
                <span>Display Name</span>
              </dt>
              <dd className="font-medium text-text-heading">
                {session?.user?.name ?? "Not provided"}
              </dd>
            </div>
            <div className="flex items-center justify-between py-3">
              <dt className="flex items-center gap-2 text-text-muted">
                <Mail className="h-4 w-4" />
                <span>Email Address</span>
              </dt>
              <dd className="font-medium text-text-heading truncate max-w-[200px] sm:max-w-xs">
                {session?.user?.email}
              </dd>
            </div>
            <div className="flex items-center justify-between py-3">
              <dt className="flex items-center gap-2 text-text-muted">
                <Shield className="h-4 w-4" />
                <span>Account Role</span>
              </dt>
              <dd className="font-medium capitalize text-text-heading">
                {session?.user?.role}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* 3. Creator Upgrade Card */}
      <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
              <PenLine className="h-3.5 w-3.5" />
              <span>Want to Publish?</span>
            </div>
            <h3 className="mt-1 font-serif text-base font-semibold text-text-heading">
              Write &amp; Earn on Contributor
            </h3>
            <p className="mt-0.5 text-xs text-text-muted max-w-md">
              Publish independent articles, launch a publication masthead, and monetize your writing with {authorSplitPct}% direct payouts.
            </p>
          </div>
          <Link
            href="/dashboard/author"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-primary-hover hover:shadow-sm"
          >
            <span>Open Author Studio</span>
          </Link>
        </div>
      </div>

      {/* 4. Sign Out */}
      <div className="pt-2">
        <SignOutButton />
      </div>
    </div>
  );
}
