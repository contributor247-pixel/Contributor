"use client";

import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";

type BannerState = "hidden" | "offline" | "back-online";

// Persistent, non-dismissable offline banner + brief "back online"
// confirmation, per docs/02_ThemeGuideline.md Section 8.5. Mounted
// once near the root layout; purely client-side (navigator.onLine +
// online/offline events), no server round-trip involved.
export function OfflineBanner() {
  const [state, setState] = useState<BannerState>("hidden");

  useEffect(() => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setState("offline");
    }

    const handleOffline = () => setState("offline");
    const handleOnline = () => {
      setState((prev) => (prev === "offline" ? "back-online" : "hidden"));
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  useEffect(() => {
    if (state !== "back-online") return;
    const timeout = setTimeout(() => setState("hidden"), 2000);
    return () => clearTimeout(timeout);
  }, [state]);

  if (state === "hidden") return null;

  const isOffline = state === "offline";

  return (
    <div
      role="status"
      className={
        isOffline
          ? "flex items-center justify-center gap-2 border-l-4 border-warning bg-ink px-4 py-2.5 text-sm font-medium text-text-inverse"
          : "flex items-center justify-center gap-2 border-l-4 border-success bg-ink px-4 py-2.5 text-sm font-medium text-text-inverse"
      }
    >
      {isOffline ? (
        <>
          <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
          You&apos;re offline — some features may not work until your connection is restored.
        </>
      ) : (
        <>
          <Wifi className="h-4 w-4 shrink-0" aria-hidden="true" />
          Back online
        </>
      )}
    </div>
  );
}
