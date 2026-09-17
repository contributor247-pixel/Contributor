import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { ContactHub } from "./ContactHub";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description: "Get in touch with the editorial team, author desk, and support team behind Contributor.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="relative min-h-screen bg-bg text-text-body">
      {/* Background ambient lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[450px] w-full max-w-[1200px] bg-[radial-gradient(ellipse_at_top,rgba(139,30,63,0.08),transparent_70%)]"
      />

      <section className="relative mx-auto max-w-[1320px] px-4 pt-10 pb-16 sm:px-6 sm:pt-14 sm:pb-20 lg:px-8 lg:pt-16 lg:pb-24">
        <ContactHub />
      </section>
    </div>
  );
}
