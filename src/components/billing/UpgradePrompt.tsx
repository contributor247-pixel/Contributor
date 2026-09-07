import Link from "next/link";
import { Sparkles } from "lucide-react";

export function UpgradePrompt({ message }: { message: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-16 text-center">
      <Sparkles className="mb-4 h-12 w-12 text-primary" aria-hidden="true" />
      <h1 className="font-serif text-xl font-semibold text-text-heading">Upgrade to AuthorPro</h1>
      <p className="mt-2 text-sm text-text-muted">{message}</p>
      <Link
        href="/dashboard/author/billing"
        className="mt-6 inline-flex h-11 items-center rounded-[4px] bg-ink px-6 text-sm font-semibold text-white transition-colors hover:bg-primary"
      >
        Go to Billing
      </Link>
    </div>
  );
}
