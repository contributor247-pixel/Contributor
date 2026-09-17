export default function VerifyOtpLoading() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-bg px-4 py-12 selection:bg-primary selection:text-white" aria-hidden="true">
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[420px] w-[420px] rounded-full bg-primary/10 blur-[120px]"
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- static asset in public/ */}
          <img
            src="/logo/logo.png"
            alt="Contributor"
            className="h-10 w-auto sm:h-12 opacity-80"
          />
          <span className="mt-2 font-serif text-xs italic tracking-wider text-text-muted">
            The Discovery Journal
          </span>
        </div>

        {/* Verification Card Skeleton */}
        <div className="rounded-3xl border border-border/80 bg-surface p-7 sm:p-9 shadow-xl backdrop-blur-md space-y-6">
          <div className="text-center">
            <div className="mx-auto h-5 w-44 animate-pulse rounded-full bg-bg-muted/80 mb-3" />
            <div className="mx-auto h-8 w-64 animate-pulse rounded-xl bg-bg-muted" />
            <div className="mx-auto mt-2 h-4 w-72 max-w-full animate-pulse rounded bg-bg-muted/60" />
          </div>

          {/* 6 OTP Cells Skeleton */}
          <div className="flex items-center justify-between gap-2 sm:gap-2.5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-13 w-11 sm:h-15 sm:w-13 animate-pulse rounded-2xl border border-border/80 bg-bg-alt/40"
              />
            ))}
          </div>

          {/* Button Skeleton */}
          <div className="h-12 w-full animate-pulse rounded-full bg-bg-muted/80" />

          {/* Resend Skeleton */}
          <div className="border-t border-border/80 pt-5 text-center">
            <div className="mx-auto h-4 w-52 animate-pulse rounded bg-bg-muted/60" />
          </div>
        </div>
      </div>
    </div>
  );
}
