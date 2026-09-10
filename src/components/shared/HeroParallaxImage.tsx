"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
export function HeroParallaxImage({ src, alt }: HeroParallaxImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!imgRef.current) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
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

    return () => ctx.revert();
  }, []);

  return (
    // eslint-disable-next-line @next/next/no-img-element -- base64 cover
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className="h-[calc(100%+40px)] w-full object-cover opacity-70"
    />
  );
}
