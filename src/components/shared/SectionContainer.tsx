interface SectionContainerProps {
  eyebrow?: string;
  heading?: string;
  children: React.ReactNode;
  className?: string;
}

export function SectionContainer({ eyebrow, heading, children, className }: SectionContainerProps) {
  return (
    <section className={`mx-auto max-w-[1320px] px-4 py-16 sm:px-6 lg:px-8 ${className ?? ""}`}>
      {(eyebrow || heading) && (
        <div className="mb-8">
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
          )}
          {heading && (
            <h2 className="mt-1 font-serif text-2xl font-semibold text-text-heading sm:text-3xl">
              {heading}
            </h2>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
