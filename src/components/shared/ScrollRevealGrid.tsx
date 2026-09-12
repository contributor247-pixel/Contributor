"use client";

import { useEffect, useRef } from "react";
import type gsapModule from "gsap";

interface ScrollRevealGridProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "ol" | "ul";
}

// Staggered fade+slide-up as a card grid enters the viewport, per
// docs/02_ThemeGuideline.md Section 6: GSAP ScrollTrigger,
// start: "top 85%", 60-80ms stagger. Wraps any grid of direct
// children (ArticleCards, etc.) — animates each immediate child,
// so this only needs one wrapper per grid rather than per-card
// wiring. Reduced motion: skips the transform/opacity setup
// entirely and lets the grid render at its resting state (GSAP
// ScrollTrigger effects are disabled outright, per Section 6's
// accessibility fallback for scroll-driven effects — a simple
// static render stands in for "simple fades only" here since
// there's no ongoing motion to fade in the first place).
export function ScrollRevealGrid({ children, className, as = "div" }: ScrollRevealGridProps) {
  const ref = useRef<HTMLDivElement>(null);
  const Tag = as;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!ref.current) return;
    const items = Array.from(ref.current.children);
    if (items.length === 0) return;

    let ctx: ReturnType<typeof gsapModule.context> | undefined;
    let cancelled = false;

    // Dynamically imported so GSAP isn't part of the initial JS bundle
    // on every page that renders a card grid — see HeroParallaxImage
    // for the same rationale (Step 16's Lighthouse pass).
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ default: gsap }, { ScrollTrigger }]) => {
      if (cancelled || !ref.current) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.fromTo(
          items,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: "power2.out",
            stagger: 0.07,
            scrollTrigger: {
              trigger: ref.current,
              start: "top 85%",
            },
          }
        );
      }, ref);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <Tag ref={ref as React.RefObject<HTMLOListElement & HTMLUListElement & HTMLDivElement>} className={className}>
      {children}
    </Tag>
  );
}
