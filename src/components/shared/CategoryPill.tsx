import Link from "next/link";

export function CategoryPill({ name, slug }: { name: string; slug: string }) {
  return (
    <Link
      href={`/content/${slug}`}
      className="font-medium text-text-body transition-colors hover:text-primary"
    >
      {name}
    </Link>
  );
}
