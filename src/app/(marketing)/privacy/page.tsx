import type { Metadata } from "next";
import { ComingSoonPlaceholder } from "@/components/shared/ComingSoonPlaceholder";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description: "Contributor's Privacy Policy.",
  path: "/privacy",
  noIndex: true,
});

export default function PrivacyPage() {
  return (
    <ComingSoonPlaceholder
      step="Coming later"
      title="Privacy Policy"
      description="Legal pages aren't part of the Master Build Guide's step sequence yet — this placeholder keeps the footer link from 404ing in the meantime."
    />
  );
}
