"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAuthModal } from "@/hooks/use-auth-modal";

// Opens the AuthModal in login mode when a protected page's server-side
// guard (src/lib/require-page-auth.ts) redirects an unauthenticated
// visitor here with ?authRequired=1, per docs/04_MasterBuildGuide.md
// Step 2.6 point 4. Strips the query param afterward so it doesn't
// linger in the URL or re-trigger on back/forward navigation.
export function AuthRequiredListener() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { open } = useAuthModal();

  useEffect(() => {
    if (searchParams.get("authRequired") === "1") {
      open("login");
      router.replace(pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return null;
}
