import { SkeletonBlock } from "./SkeletonBlock";

interface SkeletonTextProps {
  lines?: number;
  lastLineWidth?: string;
  className?: string;
}

// A stack of body-text-width shimmer bars — used for the single-article
// skeleton's paragraph placeholders per docs/02_ThemeGuideline.md
// Section 8.3.
export function SkeletonText({ lines = 3, lastLineWidth = "60%", className = "" }: SkeletonTextProps) {
  return (
    <div className={`flex flex-col gap-2.5 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBlock
          key={i}
          className="h-4 w-full"
          style={i === lines - 1 ? { width: lastLineWidth } : undefined}
        />
      ))}
    </div>
  );
}
