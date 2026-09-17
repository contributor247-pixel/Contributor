"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { SessionProvider } from "next-auth/react";
import { AuthModalProvider } from "@/hooks/use-auth-modal";
import { AuthRequiredListener } from "@/components/shared/AuthRequiredListener";
import { ToastProvider } from "@/hooks/use-toast";
import { ConfirmProvider } from "@/hooks/use-confirm";
import { SearchOverlayProvider } from "@/hooks/use-search-overlay";
import { OfflineBanner } from "@/components/shared/OfflineBanner";

// Both overlays are hidden by default (isOpen: false) and pull in
// framer-motion — loading their code eagerly on every page (including
// ones where a visitor never opens either) was adding real weight to
// the initial JS bundle/hydration cost for zero first-paint benefit.
// Neither has SEO value while closed, so ssr:false is safe here.
const AuthModal = dynamic(() => import("@/components/shared/AuthModal").then((m) => m.AuthModal), {
  ssr: false,
});
const SearchOverlay = dynamic(() => import("@/components/shared/SearchOverlay").then((m) => m.SearchOverlay), {
  ssr: false,
});

interface ProvidersProps {
  children: React.ReactNode;
  popularPills: { name: string; slug: string }[];
}

export function Providers({ children, popularPills }: ProvidersProps) {
  return (
    <SessionProvider>
      <AuthModalProvider>
        <SearchOverlayProvider>
          <ToastProvider>
            <ConfirmProvider>
              <div className="fixed inset-x-0 top-16 z-30">
                <OfflineBanner />
              </div>
              {children}
              <AuthModal />
              <SearchOverlay popularPills={popularPills} />
              <Suspense fallback={null}>
                <AuthRequiredListener />
              </Suspense>
            </ConfirmProvider>
          </ToastProvider>
        </SearchOverlayProvider>
      </AuthModalProvider>
    </SessionProvider>
  );
}
