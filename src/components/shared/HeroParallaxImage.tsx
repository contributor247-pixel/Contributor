"use client";

import { useEffect, useRef } from "react";
import type gsapModule from "gsap";

interface HeroParallaxImageProps {
  src: string;
  alt: string;
}

// Subtle GSAP ScrollTrigger parallax on the homepage hero image, per
// docs/02_ThemeGuideline.md Section 6: scrub: true, ~40px translateY
// range. Owned by GSAP (not Framer Motion) per that section's
// library-ownership rule for scroll-driven effects. Disabled under
// prefers-reduced-motion — no transform-based scroll effect runs at
// all, the image just renders static.
//
// GSAP + ScrollTrigger are dynamically imported inside the effect
// rather than statically at the top of the file — this is the
// homepage's hero, so a static import would put GSAP's ~40KB in the
// homepage's initial JS bundle even though nothing here is needed for
// first paint (the parallax only matters once the user scrolls). A
// Lighthouse pass during Step 16 measured this as real unused-JS/
// main-thread weight on first load, which this fixes.
export function HeroParallaxImage({ src, alt }: HeroParallaxImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!imgRef.current) return;

    let ctx: ReturnType<typeof gsapModule.context> | undefined;
    let cancelled = false;

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ default: gsap }, { ScrollTrigger }]) => {
      if (cancelled || !imgRef.current) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.fromTo(
          imgRef.current,
          { y: -20 },
          {
            y: 20,
            ease: "none",
            scrollTrigger: {
              trigger: imgRef.current!.closest("section"),
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    // eslint-disable-next-line @next/next/no-img-element -- base64 cover
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      // absolute + inset-0 so this sits behind the caller's own
      // overlay/text content in the same relative-positioned parent
      // instead of taking up normal document flow space (which pushed
      // any sibling content below it rather than letting it overlay).
      className="absolute inset-0 h-[calc(100%+40px)] w-full object-cover opacity-70"
    />
  );
}
