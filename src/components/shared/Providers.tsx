"use client";

import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import { AuthModalProvider } from "@/hooks/use-auth-modal";
import { AuthModal } from "@/components/shared/AuthModal";
import { AuthRequiredListener } from "@/components/shared/AuthRequiredListener";
import { ToastProvider } from "@/hooks/use-toast";
import { ConfirmProvider } from "@/hooks/use-confirm";
import { SearchOverlayProvider } from "@/hooks/use-search-overlay";
import { SearchOverlay } from "@/components/shared/SearchOverlay";
import { OfflineBanner } from "@/components/shared/OfflineBanner";

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
