"use client";

import { useEffect } from "react";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Unhandled route error:", error);
  }, [error]);

  return <ErrorBoundary onRetry={reset} />;
}
