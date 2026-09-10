import { requireRoleForPage } from "@/lib/require-page-auth";
import { getPlatformConfig } from "@/lib/actions/admin";
import { FeeConfigForm } from "./FeeConfigForm";

export default async function AdminFeesPage() {
  await requireRoleForPage("admin");
  const config = await getPlatformConfig();

  if (!config) {
    return (
      <div>
        <h1 className="mb-2 font-serif text-2xl font-semibold text-text-heading">Fee Settings</h1>
        <p className="text-sm text-error">
          No platform config row exists — the database needs to be seeded before fees can be edited.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 font-serif text-2xl font-semibold text-text-heading">Fee Settings</h1>
      <FeeConfigForm
        config={{
          authorProMonthlyCents: config.authorProMonthlyCents,
          authorProYearlyCents: config.authorProYearlyCents,
          publicationSubMonthlyCents: config.publicationSubMonthlyCents,
          publicationSubYearlyCents: config.publicationSubYearlyCents,
          platformSubMonthlyCents: config.platformSubMonthlyCents,
          platformSubYearlyCents: config.platformSubYearlyCents,
          payPerArticleMinCents: config.payPerArticleMinCents,
          payPerArticleMaxCents: config.payPerArticleMaxCents,
          standaloneAuthorSplitPct: config.standaloneAuthorSplitPct,
          standalonePlatformSplitPct: config.standalonePlatformSplitPct,
          inPublicationAuthorSplitPct: config.inPublicationAuthorSplitPct,
          inPublicationOwnerSplitPct: config.inPublicationOwnerSplitPct,
          inPublicationPlatformSplitPct: config.inPublicationPlatformSplitPct,
        }}
      />
    </div>
  );
}
