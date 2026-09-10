import Link from "next/link";
import type { ArticleCardData } from "@/components/shared/ArticleCard";
import { CategoryPill } from "@/components/shared/CategoryPill";
import { ScrollRevealGrid } from "@/components/shared/ScrollRevealGrid";
import { timeAgo } from "@/lib/time-ago";

interface EditorsPicksProps {
  featured: ArticleCardData;
  picks: ArticleCardData[];
}

export function EditorsPicks({ featured, picks }: EditorsPicksProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <Link href={`/article/${featured.slug}`} className="group block">
          <div className="relative aspect-[16/9] overflow-hidden rounded-[4px] bg-bg-muted">
            {featured.coverImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- base64 cover
              <img
                src={featured.coverImageUrl}
                alt={featured.title}
                className="h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.03]"
              />
            )}
          </div>
          <h3 className="mt-4 font-serif text-2xl font-semibold leading-snug text-text-heading transition-colors group-hover:text-primary sm:text-3xl">
            {featured.title}
          </h3>
        </Link>
        <p className="mt-2 line-clamp-2 text-text-muted">{featured.excerpt}</p>
      </div>
      <ScrollRevealGrid as="ol" className="flex flex-col divide-y divide-border lg:col-span-5">
        {picks.map((pick, i) => (
          <li key={pick.slug} className="flex gap-4 py-4 first:pt-0 last:pb-0">
            <span className="font-serif text-2xl font-semibold text-border-strong">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <span>{timeAgo(pick.publishedAt)}</span>
                <span>for</span>
                <CategoryPill name={pick.category.name} slug={pick.category.slug} />
              </div>
              <Link href={`/article/${pick.slug}`}>
                <h4 className="mt-1 line-clamp-2 font-serif text-base font-semibold leading-snug text-text-heading transition-colors hover:text-primary">
                  {pick.title}
                </h4>
              </Link>
            </div>
          </li>
        ))}
      </ScrollRevealGrid>
    </div>
  );
}
