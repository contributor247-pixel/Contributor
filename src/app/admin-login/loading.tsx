export default function AdminLoginLoading() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0C0D12] px-4 py-12 selection:bg-primary selection:text-white" aria-hidden="true">
      {/* Ambient background glows */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/15 blur-[140px]"
      />
      <div
        className="pointer-events-none absolute right-1/4 bottom-1/4 h-[350px] w-[350px] rounded-full bg-[#1e1b4b]/30 blur-[120px]"
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Top Branding Skeleton */}
        <div className="mb-6 text-center">
          <div className="mx-auto h-6 w-52 animate-pulse rounded-full bg-white/10 mb-4" />
          <div className="mx-auto h-9 w-64 animate-pulse rounded-xl bg-white/15" />
          <div className="mx-auto mt-2 h-4 w-72 max-w-full animate-pulse rounded bg-white/10" />
        </div>

        {/* Form Container Skeleton */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 sm:p-9 shadow-2xl backdrop-blur-2xl space-y-5">
          {/* Email field */}
          <div className="space-y-1.5">
            <div className="h-3.5 w-24 animate-pulse rounded bg-white/10" />
            <div className="h-12 w-full animate-pulse rounded-2xl bg-white/10" />
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-20 animate-pulse rounded bg-white/10" />
              <div className="h-3 w-16 animate-pulse rounded bg-white/10" />
            </div>
            <div className="h-12 w-full animate-pulse rounded-2xl bg-white/10" />
          </div>

          {/* Button */}
          <div className="h-12 w-full animate-pulse rounded-full bg-white/15" />

          {/* Footnote */}
          <div className="border-t border-white/10 pt-5 text-center">
            <div className="mx-auto h-3.5 w-56 animate-pulse rounded bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
