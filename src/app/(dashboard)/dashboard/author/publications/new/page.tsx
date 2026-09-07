import { requireVerifiedAuthorForPage } from "@/lib/require-page-auth";
import { requireAuthorPro, ForbiddenError } from "@/lib/permissions";
import { UpgradePrompt } from "@/components/billing/UpgradePrompt";
import { PublicationForm } from "@/components/publication/PublicationForm";

export default async function NewPublicationPage() {
  await requireVerifiedAuthorForPage();

  try {
    await requireAuthorPro();
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return (
        <UpgradePrompt message="Only AuthorPro members can create a Publication. Upgrade to start collaborating with other Authors." />
      );
    }
    throw err;
  }

  return <PublicationForm />;
}
