import { Sparkles, Search } from "lucide-react";

interface HeroBandProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function HeroBand({ eyebrow, title, description }: HeroBandProps) {
  return (
    <section
      data-dark-surface
      className="relative overflow-hidden bg-ink py-16 text-center text-white sm:py-20 lg:py-24 border-b border-white/10"
    >
      {/* Ambient layered glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(100%_100%_at_50%_0%,rgba(139,30,63,0.45),transparent_70%),radial-gradient(60%_60%_at_85%_90%,rgba(217,119,6,0.14),transparent_65%),linear-gradient(180deg,rgba(20,20,26,0.98)_0%,rgba(20,20,26,0.88)_100%)]"
      />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Pulsing Eyebrow Badge */}
        <div className="flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-supportive/50 bg-supportive/20 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-supportive-subtle backdrop-blur-xs">
            <span className="animate-pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-supportive shadow-[0_0_6px_var(--color-supportive)]" />
            {eyebrow}
          </span>
        </div>

        {/* Headline */}
        <h1 className="mt-5 text-balance font-serif text-3xl font-semibold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">
          {title}
        </h1>

        {/* Description */}
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
          {description}
        </p>
      </div>
    </section>
  );
}

