import type { Metadata } from "next";
import { ComingSoonPlaceholder } from "@/components/shared/ComingSoonPlaceholder";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description: "Get in touch with Contributor.",
  path: "/contact",
  noIndex: true,
});

export default function ContactPage() {
  return (
    <ComingSoonPlaceholder
      step="Coming later"
      title="Contact Contributor"
      description="A full Contact page isn't part of the Master Build Guide's step sequence yet — this placeholder keeps the navbar link from 404ing in the meantime."
    />
  );
}
