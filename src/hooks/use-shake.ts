"use client";

import { useEffect, useRef } from "react";

// Plays animate.css's headShake once on the ref'd element whenever
// `trigger` changes (e.g. an incrementing counter bumped on each
// validation failure), per docs/02_ThemeGuideline.md Section 6's
// "animate.css ONLY for tiny utility flourishes" rule — form-field
// shake on validation error is explicitly one of the three permitted
// uses. Toggles the class directly via the DOM (add, force reflow,
// remove on animationend) rather than driving it through React state/
// className, so repeated triggers on the same value still replay the
// animation instead of being a no-op re-render. Skipped entirely under
// prefers-reduced-motion.
export function useShake(trigger: number) {
  const ref = useRef<HTMLFormElement>(null);
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    el.classList.remove("animate__animated", "animate__headShake");
    // Force reflow so the class removal above is committed before
    // re-adding it — otherwise a second shake in quick succession
    // wouldn't restart the animation.
    void el.offsetWidth;
    el.classList.add("animate__animated", "animate__headShake");

    const handleEnd = () => el.classList.remove("animate__animated", "animate__headShake");
    el.addEventListener("animationend", handleEnd, { once: true });
    return () => el.removeEventListener("animationend", handleEnd);
  }, [trigger]);

  return ref;
}
