import { NextResponse, type NextRequest } from "next/server";

// Only handles one narrow job: a completely unauthenticated visitor
// (no session cookie at all) hitting /dashboard/admin should land on
// the dedicated /admin-login page, not the public homepage's AuthModal
// — per explicit request that the owner's admin entry point stay
// separate from the normal site login.
//
// Deliberately does NOT do the real auth/role check here — that stays
// in requireRoleForPage("admin") (src/lib/require-page-auth.ts),
// which every admin page already calls and which correctly handles a
// present-but-wrong-role or expired session (redirects home via
// ForbiddenError). Re-implementing that here would mean running the
// full Auth.js DB-backed authorize() flow in Edge middleware for no
// benefit — this only needs to know "is there a session cookie at
// all," which is a cheap, Edge-safe presence check.
//
// The parent (dashboard)/layout.tsx's requireAuthForPage() would
// otherwise redirect an unauthenticated visitor to "/" before the
// admin page's own check ever runs (layouts render parent-to-child and
// have no reliable way to know the current pathname), so this has to
// happen at the middleware/request level, before that layout renders.
const SESSION_COOKIE_NAMES = ["authjs.session-token", "__Secure-authjs.session-token"];

export function middleware(request: NextRequest) {
  const hasSession = SESSION_COOKIE_NAMES.some((name) => request.cookies.has(name));
  if (!hasSession) {
    return NextResponse.redirect(new URL("/admin-login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Matches both the bare /dashboard/admin overview page and every
  // sub-route under it (/dashboard/admin/users, /moderation/[id], etc).
  matcher: ["/dashboard/admin", "/dashboard/admin/:path*"],
};
