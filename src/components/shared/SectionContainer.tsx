interface SectionContainerProps {
  eyebrow?: string;
  heading?: string;
  // Defaults to h2, since most callers sit below a page-level <h1>
  // owned by HeroBand/HomeHero. Pages with no hero component of their
  // own (e.g. /search) pass "h1" so the page still has exactly one,
  // per docs/04_MasterBuildGuide.md Step 16.3's semantic-HTML audit.
  headingLevel?: "h1" | "h2";
  children: React.ReactNode;
  className?: string;
}

export function SectionContainer({ eyebrow, heading, headingLevel = "h2", children, className }: SectionContainerProps) {
  const HeadingTag = headingLevel;
  return (
    <section className={`mx-auto max-w-[1320px] px-4 py-16 sm:px-6 lg:px-8 ${className ?? ""}`}>
      {(eyebrow || heading) && (
        <div className="mb-8">
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
          )}
          {heading && (
            <HeadingTag className="mt-1 font-serif text-2xl font-semibold text-text-heading sm:text-3xl">
              {heading}
            </HeadingTag>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
