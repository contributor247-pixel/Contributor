import { Loader2 } from "lucide-react";

export default function VerifyEmailLoading() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-bg px-4 py-12 selection:bg-primary selection:text-white" aria-hidden="true">
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[420px] w-[420px] rounded-full bg-primary/10 blur-[120px]"
      />

      <div className="relative z-10 w-full max-w-md text-center">
        {/* Brand Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- static asset in public/ */}
          <img
            src="/logo/logo.png"
            alt="Contributor"
            className="h-10 w-auto sm:h-12"
          />
          <span className="mt-2 font-serif text-xs italic tracking-wider text-text-muted">
            The Discovery Journal
          </span>
        </div>

        {/* Status Card Skeleton */}
        <div className="rounded-3xl border border-border/80 bg-surface p-7 sm:p-9 shadow-xl backdrop-blur-md text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>

          <div className="mx-auto h-5 w-32 animate-pulse rounded-full bg-bg-muted/80" />
          <div className="mx-auto h-8 w-56 animate-pulse rounded-xl bg-bg-muted" />
          <div className="mx-auto h-4 w-72 max-w-full animate-pulse rounded bg-bg-muted/60" />
        </div>
      </div>
    </div>
  );
}
