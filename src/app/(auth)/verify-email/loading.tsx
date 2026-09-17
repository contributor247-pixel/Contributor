import { Loader2 } from "lucide-react";

// verifyEmailAction does a real DB write (consume the verification
// token, mark the user verified, mint an auto-login token) before this
// route can render anything — measured at ~2.7s to first byte plus a
// further blank-shell gap under this session's documented Neon
// latency, with no indication anything was happening. This mirrors
// VerifyEmailClient's shell exactly so the transition into the real
// content doesn't visibly jump.
export default function VerifyEmailLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element -- static asset in public/, not worth next/image's overhead for a fixed-size auth-page logo */}
      <img src="/logo/logo.png" alt="Contributor" className="h-11 w-auto sm:h-13" />
      <span className="mb-8 mt-2 font-serif text-xs italic tracking-wide text-text-muted">
        The Discovery Journal
      </span>
      <div className="max-w-md rounded-[4px] border border-border bg-surface p-10 shadow-sm">
        <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary motion-reduce:animate-none" aria-hidden="true" />
        <h1 className="mb-2 font-serif text-2xl font-semibold text-text-heading">
          Verifying your email
        </h1>
        <p className="text-sm text-text-muted">This will just take a moment...</p>
      </div>
    </div>
  );
}
