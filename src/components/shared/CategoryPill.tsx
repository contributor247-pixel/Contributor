import Link from "next/link";

// Vertical negative margin expands the tap target to ~24px tall (per
// WCAG's target-size AA criterion, flagged by a Lighthouse audit in
// Step 16) without pushing the surrounding byline row's line-height
// open — visually identical, just a larger invisible hit area.
export function CategoryPill({ name, slug }: { name: string; slug: string }) {
  return (
    <Link
      href={`/content/${slug}`}
      className="-my-1 inline-block py-1 font-medium text-text-body transition-colors hover:text-primary"
    >
      {name}
    </Link>
  );
}
