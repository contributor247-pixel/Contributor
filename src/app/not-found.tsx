import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <FileQuestion className="mb-4 h-12 w-12 text-text-muted" aria-hidden="true" />
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">404</p>
      <h1 className="mt-2 font-serif text-3xl font-semibold text-text-heading">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-text-muted">
        This page doesn&apos;t exist, or is no longer available.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-11 items-center rounded-[4px] bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-primary"
      >
        Back to Homepage
      </Link>
    </div>
  );
}
