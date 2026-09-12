import type { Metadata } from "next";
import { ComingSoonPlaceholder } from "@/components/shared/ComingSoonPlaceholder";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description: "About Contributor.",
  path: "/about",
  noIndex: true,
});

export default function AboutPage() {
  return (
    <ComingSoonPlaceholder
      step="Coming later"
      title="About Contributor"
      description="A full About page isn't part of the Master Build Guide's step sequence yet — this placeholder keeps the navbar link from 404ing in the meantime."
    />
  );
}
