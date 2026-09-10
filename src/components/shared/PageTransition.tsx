"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// Soft fade + 8px vertical slide between route changes, per
// docs/02_ThemeGuideline.md Section 6. Keyed on pathname so
// AnimatePresence treats each route as a distinct child to
// transition between; falls back to a fast opacity-only fade under
// prefers-reduced-motion rather than skipping the transition
// entirely (an instant cut still needs a moment to avoid a flash of
// unstyled layout during hydration of the new route).
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
        transition={{ duration: prefersReducedMotion ? 0.01 : 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-1 flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
