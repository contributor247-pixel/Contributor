"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { AlertTriangle } from "lucide-react";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  // Destructive actions (delete/suspend/cancel/unpublish) get the red
  // confirm button + warning-triangle icon; non-destructive
  // confirmations (rare, but SubscribeButton's plan-change notice uses
  // this) get the plain ink button instead.
  destructive?: boolean;
}

type ConfirmFn = (options: ConfirmOptions | string) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

// Replaces window.confirm() across the app (DeleteArticleButton,
// CancelSubscriptionButton, SubscribeButton, CommentList,
// ReportActions, UserRowActions all used the native browser dialog for
// destructive/consequential actions — inconsistent with every other
// dialog in the app, which uses this same @base-ui/react/dialog
// primitive styled to match, per docs/02_ThemeGuideline.md's modal
// spec and the app's existing AuthModal/ReportDialog pattern).
//
// Promise-based rather than a render-prop/JSX API so each call site's
// existing `if (!window.confirm(msg)) return;` becomes
// `if (!(await confirm(msg))) return;` — same control flow, minimal
// restructuring, no behavior change beyond the visual/keyboard-a11y
// upgrade.
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((opts) => {
    const normalized = typeof opts === "string" ? { message: opts } : opts;
    setOptions(normalized);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleResolve = useCallback((value: boolean) => {
    resolveRef.current?.(value);
    resolveRef.current = null;
    setOptions(null);
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <DialogPrimitive.Root open={options !== null} onOpenChange={(open) => !open && handleResolve(false)}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-[rgba(10,10,12,0.72)]" />
          <DialogPrimitive.Popup
            role="alertdialog"
            className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow-2xl outline-none"
          >
            {options && (
              <>
                <div className="flex items-start gap-3">
                  {options.destructive !== false && (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-error/10 text-error">
                      <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                    </span>
                  )}
                  <div>
                    <DialogPrimitive.Title className="font-serif text-lg font-semibold text-text-heading">
                      {options.title ?? (options.destructive !== false ? "Are you sure?" : "Confirm")}
                    </DialogPrimitive.Title>
                    <DialogPrimitive.Description className="mt-1 text-sm text-text-muted">
                      {options.message}
                    </DialogPrimitive.Description>
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    autoFocus
                    onClick={() => handleResolve(false)}
                    className="flex h-10 items-center rounded-[4px] border border-border-strong px-4 text-sm font-semibold text-text-body transition-colors hover:bg-bg-muted"
                  >
                    {options.cancelLabel ?? "Cancel"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResolve(true)}
                    className={
                      options.destructive !== false
                        ? "flex h-10 items-center rounded-[4px] bg-error px-4 text-sm font-semibold text-white transition-colors hover:bg-error/90"
                        : "flex h-10 items-center rounded-[4px] bg-ink px-4 text-sm font-semibold text-white transition-colors hover:bg-primary"
                    }
                  >
                    {options.confirmLabel ?? "Confirm"}
                  </button>
                </div>
              </>
            )}
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx;
}
