import type { LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  headline: string;
  description: string;
  cta?: { label: string; href: string };
}

// Per docs/02_ThemeGuideline.md Section 8.4 — a single reusable
// component for every empty-list/grid case across the app, rather than
// one-off markup per page.
export function EmptyState({ icon: Icon, headline, description, cta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <Icon className="mb-4 h-12 w-12 text-text-muted" aria-hidden="true" />
      <h3 className="font-serif text-lg font-semibold text-text-heading">{headline}</h3>
      <p className="mt-1 max-w-sm text-sm text-text-muted">{description}</p>
      {cta && (
        <Link
          href={cta.href}
          className="mt-6 inline-flex h-10 items-center rounded-[4px] bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-primary"
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}
