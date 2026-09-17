import { requireVerifiedAuthorForPage } from "@/lib/require-page-auth";
import { getMyPendingInvitesAction } from "@/lib/actions/publication";
import { InvitesList } from "@/components/publication/InvitesList";
import { Layers } from "lucide-react";

export default async function InvitesPage() {
  await requireVerifiedAuthorForPage();
  const invites = await getMyPendingInvitesAction().catch(() => []);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="border-b border-border/80 pb-5">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          <Layers className="h-3.5 w-3.5" />
          <span>Collaborations</span>
        </div>
        <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-text-heading">
          Publication Invites
        </h1>
        <p className="mt-0.5 text-xs text-text-muted">
          Review and respond to invitations to write under shared publication mastheads.
        </p>
      </div>

      <InvitesList initialInvites={invites} />
    </div>
  );
}
