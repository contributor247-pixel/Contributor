"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";

export type ToastVariant = "success" | "error" | "warning" | "info";

interface ToastMessage {
  id: number;
  text: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  // Kept as the original single-argument signature call sites already
  // use (show(text)) — variant is optional and defaults to "success",
  // so no existing caller needs to change. showError/showWarning/
  // showInfo are thin convenience wrappers for new call sites.
  show: (text: string, variant?: ToastVariant) => void;
  showError: (text: string) => void;
  showWarning: (text: string) => void;
  showInfo: (text: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 1;

// One icon + accent color per variant, sharing the same dark pill
// shape so the family reads as one system — only the semantic color
// changes, per docs/02_ThemeGuideline.md Section 2's existing
// success/warning/error tokens (no new colors introduced).
const VARIANT_CONFIG: Record<ToastVariant, { icon: typeof CheckCircle2; iconClassName: string }> = {
  success: { icon: CheckCircle2, iconClassName: "text-success" },
  error: { icon: XCircle, iconClassName: "text-error" },
  warning: { icon: AlertTriangle, iconClassName: "text-warning" },
  info: { icon: Info, iconClassName: "text-white/70" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const show = useCallback((text: string, variant: ToastVariant = "success") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, text, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const showError = useCallback((text: string) => show(text, "error"), [show]);
  const showWarning = useCallback((text: string) => show(text, "warning"), [show]);
  const showInfo = useCallback((text: string) => show(text, "info"), [show]);

  return (
    <ToastContext.Provider value={{ show, showError, showWarning, showInfo }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center gap-2"
      >
        {toasts.map((t) => {
          const { icon: Icon, iconClassName } = VARIANT_CONFIG[t.variant];
          return (
            <div
              key={t.id}
              role={t.variant === "error" ? "alert" : "status"}
              className="pointer-events-auto flex items-center gap-2 rounded-[4px] bg-ink px-4 py-3 text-sm font-medium text-white shadow-lg"
            >
              <Icon
                className={`animate__animated animate__pulse motion-reduce:animate-none h-4 w-4 shrink-0 ${iconClassName}`}
                aria-hidden="true"
              />
              {t.text}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
