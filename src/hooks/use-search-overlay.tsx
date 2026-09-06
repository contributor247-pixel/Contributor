"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

interface SearchOverlayContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const SearchOverlayContext = createContext<SearchOverlayContextValue | null>(null);

export function SearchOverlayProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);

  return <SearchOverlayContext.Provider value={value}>{children}</SearchOverlayContext.Provider>;
}

export function useSearchOverlay() {
  const ctx = useContext(SearchOverlayContext);
  if (!ctx) throw new Error("useSearchOverlay must be used within SearchOverlayProvider");
  return ctx;
}
