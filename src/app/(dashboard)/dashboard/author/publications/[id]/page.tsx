import { notFound } from "next/navigation";
import { requireVerifiedAuthorForPage } from "@/lib/require-page-auth";
import { ForbiddenError } from "@/lib/permissions";
import { getPublicationForManagementAction, getPublicationArticlesAction } from "@/lib/actions/publication";
import { PublicationManagementTabs } from "@/components/publication/PublicationManagementTabs";

interface ManagePublicationPageProps {
  params: Promise<{ id: string }>;
}

export default async function ManagePublicationPage({ params }: ManagePublicationPageProps) {
  await requireVerifiedAuthorForPage();
  const { id } = await params;

  let publication;
  try {
    publication = await getPublicationForManagementAction(id);
  } catch (err) {
    if (err instanceof ForbiddenError) notFound();
    throw err;
  }
  if (!publication) notFound();

  const articles = await getPublicationArticlesAction(id);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 font-serif text-2xl font-semibold text-text-heading">{publication.name}</h1>
      {publication.description && <p className="mb-6 text-sm text-text-muted">{publication.description}</p>}
      <PublicationManagementTabs publicationId={publication.id} articles={articles} />
    </div>
  );
}
