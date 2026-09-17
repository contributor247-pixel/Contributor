import { Sparkles } from "lucide-react";

export function PremiumBadge() {
  return (
    <span
      className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-ink/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-200 shadow-sm backdrop-blur-md"
      aria-label="Premium story"
      title="Premium story unlocked via Author subscription or individual pass"
    >
      <Sparkles className="h-3 w-3 text-amber-400" aria-hidden="true" />
      <span>Premium</span>
    </span>
  );
}
