import Link from "next/link";
import { Avatar } from "@/components/shared/Avatar";
import { CategoryPill } from "@/components/shared/CategoryPill";
import { PremiumBadge } from "@/components/shared/PremiumBadge";
import { timeAgo } from "@/lib/time-ago";

export interface ArticleCardData {
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  isPremium: boolean;
  publishedAt: Date | null;
  category: { name: string; slug: string };
  author: { name: string | null; avatarUrl: string | null };
}

interface ArticleCardProps {
  article: ArticleCardData;
  showExcerpt?: boolean;
}

export function ArticleCard({ article, showExcerpt = true }: ArticleCardProps) {
  return (
    <article className="group flex flex-col transition-transform duration-200 ease-out hover:-translate-y-1">
      <Link href={`/article/${article.slug}`} className="relative block aspect-[16/10] overflow-hidden rounded-[4px] bg-bg-muted">
        {article.isPremium && <PremiumBadge />}
        {article.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- covers are stored as base64 data URLs
          <img
            src={article.coverImageUrl}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-muted">No image</div>
        )}
      </Link>
      <div className="mt-3 flex flex-1 flex-col">
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <span>{timeAgo(article.publishedAt)}</span>
          <span>for</span>
          <CategoryPill name={article.category.name} slug={article.category.slug} />
        </div>
        <Link href={`/article/${article.slug}`}>
          <h3 className="mt-1.5 line-clamp-2 font-serif text-lg font-semibold leading-snug text-text-heading transition-colors group-hover:text-primary">
            {article.title}
          </h3>
        </Link>
        {showExcerpt && article.excerpt && (
          <p className="mt-1.5 line-clamp-2 text-sm text-text-muted">{article.excerpt}</p>
        )}
        <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
          <Avatar name={article.author.name} avatarUrl={article.author.avatarUrl} size={24} />
          <span>
            Created by <span className="text-text-body">{article.author.name ?? "Unknown"}</span>
          </span>
        </div>
      </div>
    </article>
  );
}
