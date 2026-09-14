import type { Metadata } from "next";
import { Mail, Clock, ShieldQuestion } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description: "Get in touch with the team behind Contributor.",
  path: "/contact",
});

const REASONS = [
  {
    icon: Mail,
    title: "General questions",
    description: "Anything about reading, writing, or Publications on Contributor.",
  },
  {
    icon: ShieldQuestion,
    title: "Account or billing",
    description: "Purchases, subscriptions, or something in your dashboard that isn't working.",
  },
  {
    icon: Clock,
    title: "Response time",
    description: "We read every message and typically reply within a couple of business days.",
  },
];

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Get in Touch
          </p>
          <h1 className="mt-4 text-balance font-serif text-4xl font-semibold leading-[1.1] text-text-heading sm:text-5xl">
            Questions, feedback, or something that isn&apos;t working — write in.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-text-muted">
            A real person on the Contributor team reads every message sent through this form.
          </p>

          <ul className="mt-10 flex flex-col gap-6">
            {REASONS.map((r) => (
              <li key={r.title} className="flex gap-4">
                <r.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <p className="font-serif text-base font-semibold text-text-heading">{r.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-text-muted">{r.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-7">
          <div className="rounded-[4px] border border-border-strong bg-surface p-6 sm:p-10">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
