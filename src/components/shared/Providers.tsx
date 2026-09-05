"use client";

import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import { AuthModalProvider } from "@/hooks/use-auth-modal";
import { AuthModal } from "@/components/shared/AuthModal";
import { AuthRequiredListener } from "@/components/shared/AuthRequiredListener";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthModalProvider>
        {children}
        <AuthModal />
        <Suspense fallback={null}>
          <AuthRequiredListener />
        </Suspense>
      </AuthModalProvider>
    </SessionProvider>
  );
}
