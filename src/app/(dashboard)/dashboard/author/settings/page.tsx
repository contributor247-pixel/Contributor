import { requireVerifiedAuthorForPage } from "@/lib/require-page-auth";
import { SignOutButton } from "@/components/dashboard/SignOutButton";

export default async function AuthorSettingsPage() {
  const session = await requireVerifiedAuthorForPage();

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 font-serif text-2xl font-semibold text-text-heading">Settings</h1>

      <div className="rounded-[4px] border border-border-strong p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-text-muted">Account</p>
        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-text-muted">Name</dt>
            <dd className="font-medium text-text-heading">{session?.user?.name ?? "—"}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-text-muted">Email</dt>
            <dd className="font-medium text-text-heading">{session?.user?.email}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-text-muted">Role</dt>
            <dd className="font-medium capitalize text-text-heading">{session?.user?.role}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-6">
        <SignOutButton />
      </div>
    </div>
  );
}
