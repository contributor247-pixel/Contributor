"use client";

import { useEffect, useState } from "react";

// Flips to true once `isLoading` has been true for longer than
// `thresholdMs`, so a loading UI can show a secondary "still working"
// message rather than an indefinite bare spinner, per
// docs/02_ThemeGuideline.md Section 8.6. Resets whenever isLoading
// goes false again.
export function useSlowLoading(isLoading: boolean, thresholdMs = 2000): boolean {
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsSlow(false);
      return;
    }
    const timeout = setTimeout(() => setIsSlow(true), thresholdMs);
    return () => clearTimeout(timeout);
  }, [isLoading, thresholdMs]);

  return isSlow;
}
