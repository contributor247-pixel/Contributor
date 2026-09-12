import type { Metadata } from "next";
import { ComingSoonPlaceholder } from "@/components/shared/ComingSoonPlaceholder";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Service",
  description: "Contributor's Terms of Service.",
  path: "/terms",
  noIndex: true,
});

export default function TermsPage() {
  return (
    <ComingSoonPlaceholder
      step="Coming later"
      title="Terms of Service"
      description="Legal pages aren't part of the Master Build Guide's step sequence yet — this placeholder keeps the footer link from 404ing in the meantime."
    />
  );
}
