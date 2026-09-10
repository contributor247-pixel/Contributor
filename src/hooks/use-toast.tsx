"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2 } from "lucide-react";

interface ToastMessage {
  id: number;
  text: string;
}

interface ToastContextValue {
  show: (text: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const show = useCallback((text: string) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex items-center gap-2 rounded-[4px] bg-ink px-4 py-3 text-sm font-medium text-white shadow-lg"
          >
            <CheckCircle2
              className="animate__animated animate__pulse motion-reduce:animate-none h-4 w-4 shrink-0 text-success"
              aria-hidden="true"
            />
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
