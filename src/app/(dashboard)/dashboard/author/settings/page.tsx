import { User, Mail, Shield, Sparkles, ShieldCheck } from "lucide-react";
import { requireVerifiedAuthorForPage } from "@/lib/require-page-auth";
import { SignOutButton } from "@/components/dashboard/SignOutButton";

function initials(name: string | null | undefined, email: string | null | undefined): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || parts[0]?.[0]?.toUpperCase() || "?";
  }
  return email?.[0]?.toUpperCase() ?? "?";
}

export default async function AuthorSettingsPage() {
  const session = await requireVerifiedAuthorForPage();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* 1. Page Header */}
      <div className="border-b border-border/80 pb-5">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Author Credentials</span>
        </div>
        <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-text-heading">
          Account &amp; Studio Settings
        </h1>
        <p className="mt-0.5 text-xs text-text-muted">
          Your author profile, security credentials, and platform role.
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
              {session?.user?.name ?? "Contributor Author"}
            </h2>
            <p className="text-xs text-text-muted">{session?.user?.email}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                <Shield className="h-3 w-3" />
                <span>{session?.user?.role ?? "author"}</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3 w-3" />
                <span>Verified 2FA</span>
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border/70 pt-6">
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
            Profile Information
          </h3>
          <dl className="mt-4 divide-y divide-border/60 text-sm">
            <div className="flex items-center justify-between py-3">
              <dt className="flex items-center gap-2 text-text-muted">
                <User className="h-4 w-4" />
                <span>Author Display Name</span>
              </dt>
              <dd className="font-medium text-text-heading">
                {session?.user?.name ?? "Not provided"}
              </dd>
            </div>
            <div className="flex items-center justify-between py-3">
              <dt className="flex items-center gap-2 text-text-muted">
                <Mail className="h-4 w-4" />
                <span>Registered Email</span>
              </dt>
              <dd className="font-medium text-text-heading truncate max-w-[200px] sm:max-w-xs">
                {session?.user?.email}
              </dd>
            </div>
            <div className="flex items-center justify-between py-3">
              <dt className="flex items-center gap-2 text-text-muted">
                <Shield className="h-4 w-4" />
                <span>Author Verification Status</span>
              </dt>
              <dd className="font-medium text-emerald-600 dark:text-emerald-400">
                Active &bull; OTP Verified
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* 3. Sign Out */}
      <div className="pt-2">
        <SignOutButton />
      </div>
    </div>
  );
}
