"use client";

import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import { AuthModalProvider } from "@/hooks/use-auth-modal";
import { AuthModal } from "@/components/shared/AuthModal";
import { AuthRequiredListener } from "@/components/shared/AuthRequiredListener";
import { ToastProvider } from "@/hooks/use-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthModalProvider>
        <ToastProvider>
          {children}
          <AuthModal />
          <Suspense fallback={null}>
            <AuthRequiredListener />
          </Suspense>
        </ToastProvider>
      </AuthModalProvider>
    </SessionProvider>
  );
}
