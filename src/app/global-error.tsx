"use client";

// Next.js's root app/error.tsx does NOT catch errors thrown inside the
// root layout itself (src/app/layout.tsx) or its own <html>/<body> —
// only app/global-error.tsx does. That layout is the one file every
// single request renders through (see its own comment about a prior
// incident where an unguarded DB call there 500'd the entire site),
// so leaving this uncaught meant any future failure there — even an
// unrelated one in a client provider — fell through to Next's bare,
// unstyled default error page instead of anything branded or
// recoverable. This file must render its own <html>/<body> (it
// replaces the root layout when it fires) and can't rely on any
// styling/providers from layout.tsx, since that's exactly what just
// failed.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "8px" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#6b7280", maxWidth: "24rem", marginBottom: "24px" }}>
            Contributor hit an unexpected error. Please try again.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              height: "44px",
              padding: "0 20px",
              borderRadius: "4px",
              border: "1px solid #111114",
              background: "transparent",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
