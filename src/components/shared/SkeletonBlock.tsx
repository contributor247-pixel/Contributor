interface SkeletonBlockProps {
  className?: string;
  style?: React.CSSProperties;
}

// Generic shimmer primitive — a gradient sweep left-to-right, falling
// back to a static bg-muted block under prefers-reduced-motion, per
// docs/02_ThemeGuideline.md Section 8.3. Composed into page-specific
// skeletons (SkeletonCard, single-article skeleton, etc.) rather than
// used bare, except for simple bar shapes.
export function SkeletonBlock({ className = "", style }: SkeletonBlockProps) {
  return (
    <div
      className={`animate-shimmer rounded bg-bg-muted motion-reduce:animate-none ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}
