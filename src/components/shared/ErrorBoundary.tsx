"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

interface ErrorBoundaryProps {
  onRetry: () => void;
  headline?: string;
  description?: string;
}

// Full-page error state for a broken route segment, composed by each
// route's error.tsx per docs/02_ThemeGuideline.md Section 8.7 — icon +
// headline + copy matching EmptyState's layout conventions, plus a
// built-in Retry action (8.8): the button enters its own brief loading
// sub-state while onRetry() runs, and simply re-renders this same
// error UI again if the retry doesn't resolve (no infinite spinner).
export function ErrorBoundary({
  onRetry,
  headline = "Something went wrong",
  description = "We hit an unexpected error loading this page.",
}: ErrorBoundaryProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    onRetry();
    // reset() re-renders the segment; if it still throws, this
    // component simply mounts again a moment later, so isRetrying
    // naturally starts fresh with the next render — no manual reset
    // needed here to avoid a spinner stuck on across that boundary.
  };

  return (
    <div role="alert" className="flex flex-col items-center justify-center px-6 py-24 text-center">
      <AlertTriangle className="mb-4 h-12 w-12 text-error" aria-hidden="true" />
      <h1 className="font-serif text-2xl font-semibold text-text-heading">{headline}</h1>
      <p className="mt-2 max-w-sm text-sm text-text-muted">{description}</p>
      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={handleRetry}
          disabled={isRetrying}
          className="flex h-11 items-center rounded-[4px] border border-ink px-5 text-sm font-semibold text-ink transition-colors hover:bg-bg-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRetrying ? "Retrying..." : "Try again"}
        </button>
        <Link
          href="/"
          className="flex h-11 items-center rounded-[4px] px-5 text-sm font-semibold text-text-muted transition-colors hover:text-text-body"
        >
          Back to homepage
        </Link>
      </div>
    </div>
  );
}
