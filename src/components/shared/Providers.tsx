"use client";

import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import { AuthModalProvider } from "@/hooks/use-auth-modal";
import { AuthModal } from "@/components/shared/AuthModal";
import { AuthRequiredListener } from "@/components/shared/AuthRequiredListener";
import { ToastProvider } from "@/hooks/use-toast";
import { SearchOverlayProvider } from "@/hooks/use-search-overlay";
import { SearchOverlay } from "@/components/shared/SearchOverlay";

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
            {children}
            <AuthModal />
            <SearchOverlay popularPills={popularPills} />
            <Suspense fallback={null}>
              <AuthRequiredListener />
            </Suspense>
          </ToastProvider>
        </SearchOverlayProvider>
      </AuthModalProvider>
    </SessionProvider>
  );
}
