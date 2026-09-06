interface ComingSoonPlaceholderProps {
  step: string;
  title: string;
  description: string;
}

export function ComingSoonPlaceholder({ step, title, description }: ComingSoonPlaceholderProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-32 text-center">
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">{step}</p>
      <h1 className="max-w-2xl font-serif text-4xl font-semibold text-text-heading sm:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-lg text-text-muted">{description}</p>
    </div>
  );
}
