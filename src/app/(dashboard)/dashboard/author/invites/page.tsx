import { requireVerifiedAuthorForPage } from "@/lib/require-page-auth";
import { getMyPendingInvitesAction } from "@/lib/actions/publication";
import { InvitesList } from "@/components/publication/InvitesList";

export default async function InvitesPage() {
  await requireVerifiedAuthorForPage();
  const invites = await getMyPendingInvitesAction();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 font-serif text-2xl font-semibold text-text-heading">Invites</h1>
      <InvitesList initialInvites={invites} />
    </div>
  );
}
