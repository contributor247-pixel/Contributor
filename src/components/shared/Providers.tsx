"use client";

import { SessionProvider } from "next-auth/react";
import { AuthModalProvider } from "@/hooks/use-auth-modal";
import { AuthModal } from "@/components/shared/AuthModal";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthModalProvider>
        {children}
        <AuthModal />
      </AuthModalProvider>
    </SessionProvider>
  );
}
