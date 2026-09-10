"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";

interface MagneticButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  children: React.ReactNode;
  magneticRadius?: number;
  magneticStrength?: number;
}

// Magnetic hover (slight translate toward the cursor within a small
// radius) on large hero/paywall CTA buttons specifically, per
// docs/02_ThemeGuideline.md Section 6 — deliberately NOT applied to
// every button, only this component. Tap scale-down is included here
// too so these specific CTAs get the true Framer Motion whileTap the
// spec describes, on top of the app-wide CSS fallback in globals.css.
export function MagneticButton({
  children,
  magneticRadius = 60,
  magneticStrength = 0.3,
  className,
  ...buttonProps
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const prefersReducedMotion = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (prefersReducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < magneticRadius) {
      setOffset({ x: dx * magneticStrength, y: dy * magneticStrength });
    } else {
      setOffset({ x: 0, y: 0 });
    }
  };

  const handleMouseLeave = () => setOffset({ x: 0, y: 0 });

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: offset.x, y: offset.y }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 200, damping: 15, mass: 0.5 }}
      className={className}
      {...buttonProps}
    >
      {children}
    </motion.button>
  );
}
