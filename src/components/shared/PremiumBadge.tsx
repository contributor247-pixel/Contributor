import { Lock } from "lucide-react";

export function PremiumBadge() {
  return (
    <span
      className="absolute left-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-[4px] bg-ink text-white"
      aria-label="Premium article"
      title="Premium article"
    >
      <Lock className="h-4 w-4" />
    </span>
  );
}
