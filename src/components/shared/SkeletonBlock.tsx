interface SkeletonBlockProps {
  className?: string;
  style?: React.CSSProperties;
  // "light" (default) uses the .animate-shimmer gradient (bg-bg-muted
  // -> border -> bg-bg-muted), correct on white/bg surfaces. "dark" is
  // for skeletons sitting on a bg-ink surface (HomeHero, the
  // Publication header band, category hero bands) — .animate-shimmer
  // sets background-image, so passing a bg-white/N className to try
  // to recolor it for a dark surface does nothing (background-image
  // always paints over background-color) — this was a real, confirmed
  // bug across 3 loading.tsx files that all tried exactly that. "dark"
  // renders a plain semi-transparent white block instead — no
  // shimmer-sweep animation on this variant, since the gradient
  // itself is what shimmer.tsx uses, and re-deriving a dark shimmer
  // gradient token isn't worth it for skeletons that are on screen for
  // a moment.
  variant?: "light" | "dark";
}

// Generic shimmer primitive — a gradient sweep left-to-right, falling
// back to a static bg-muted block under prefers-reduced-motion, per
// docs/02_ThemeGuideline.md Section 8.3. Composed into page-specific
// skeletons (SkeletonCard, single-article skeleton, etc.) rather than
// used bare, except for simple bar shapes.
export function SkeletonBlock({ className = "", style, variant = "light" }: SkeletonBlockProps) {
  if (variant === "dark") {
    return (
      <div
        className={`animate-pulse rounded bg-white/10 motion-reduce:animate-none ${className}`}
        style={style}
        aria-hidden="true"
      />
    );
  }
  return (
    <div
      className={`animate-shimmer rounded bg-bg-muted motion-reduce:animate-none ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}
