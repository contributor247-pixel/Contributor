"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useAuthModal } from "@/hooks/use-auth-modal";
import { useToast } from "@/hooks/use-toast";

// Opens the AuthModal in login mode when a protected page's server-side
// guard (src/lib/require-page-auth.ts) redirects an unauthenticated
// visitor here with ?authRequired=1, per docs/04_MasterBuildGuide.md
// Step 2.6 point 4. Strips the query param afterward so it doesn't
// linger in the URL or re-trigger on back/forward navigation.
//
// Also handles ?suspended=1: requireAuth() re-checks the account's
// live status in the DB on every call (not just the JWT's stale
// session.user.status), so a user suspended mid-session gets bounced
// here the next time they hit a protected page. The JWT itself is
// still technically valid at that point — the server-side guard can't
// call next-auth's signOut() itself (it mutates cookies, which Next
// only allows from a Server Action/Route Handler, not mid-render) —
// so the actual sign-out happens here, client-side, where it's safe.
export function AuthRequiredListener() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { open } = useAuthModal();
  const { showError } = useToast();

  useEffect(() => {
    if (searchParams.get("authRequired") === "1") {
      open("login");
      router.replace(pathname);
    }
    if (searchParams.get("suspended") === "1") {
      showError("Your account has been suspended. Contact support if you believe this is a mistake.");
      router.replace(pathname);
      // signOut's own redirect is skipped since we already redirected
      // above, but its default POST doesn't always clear the cookie
      // reliably without a full navigation afterward — force one so
      // the client's session state actually resyncs with the (now
      // signed-out) server rather than still showing "signed in" until
      // the next natural session refresh.
      signOut({ redirect: false })
        .catch(() => {})
        .finally(() => router.refresh());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return null;
}
