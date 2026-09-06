interface HeroBandProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function HeroBand({ eyebrow, title, description }: HeroBandProps) {
  return (
    <section className="bg-primary px-4 py-20 text-center text-white sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">{eyebrow}</p>
      <h1 className="mx-auto mt-3 max-w-2xl font-serif text-4xl font-semibold sm:text-5xl">{title}</h1>
      <p className="mx-auto mt-4 max-w-xl text-sm text-white/85">{description}</p>
    </section>
  );
}
