import { SkeletonBlock } from "@/components/shared/SkeletonBlock";

// Exact 1:1 layout-matched streamed fallback for the Article Reading View.
// Mirrors the full editorial layout: Breadcrumb bar + 740px Reading Stream
// (Eyebrow, Display Headline, Excerpt, Byline & Share Bar, 16:9 Cover, Rich Prose,
// Footer Meta, Comments) + 340px Desktop Sticky Sidebar (Author Spotlight + Next in Stream).
export default function ArticleLoading() {
  return (
    <div className="relative min-h-screen bg-bg">
      {/* Top Reading Progress Bar skeleton */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-border/40" aria-hidden="true" />

      {/* Main Reading Container */}
      <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Top Breadcrumb & Navigation Row */}
        <div className="mb-6 flex items-center justify-between border-b border-border/70 pb-4">
          <SkeletonBlock className="h-4 w-36 rounded-full" />
          <div className="flex items-center gap-2">
            <SkeletonBlock className="h-6 w-24 rounded-full" />
            <SkeletonBlock className="h-6 w-20 rounded-full" />
          </div>
        </div>

        {/* 2-Column Responsive Layout: Centered Reading Stream (740px) + Sticky Sidebar (340px) */}
        <div className="lg:flex lg:items-start lg:gap-12 xl:gap-16">
          {/* Main Article Column */}
          <div className="mx-auto max-w-3xl lg:mx-0 lg:max-w-[740px] lg:flex-1">
            {/* Category / Publication Attribution */}
            <div className="flex items-center gap-2">
              <SkeletonBlock className="h-3.5 w-28" />
              <SkeletonBlock className="h-3 w-36" />
            </div>

            {/* Main Headline */}
            <SkeletonBlock className="mt-4 h-10 w-full sm:h-12 lg:h-14" />
            <SkeletonBlock className="mt-2.5 h-10 w-4/5 sm:h-12 lg:h-14" />

            {/* Excerpt / Lead */}
            <div className="mt-5 space-y-2">
              <SkeletonBlock className="h-5 w-full" />
              <SkeletonBlock className="h-5 w-5/6" />
            </div>

            {/* Author Byline & Social Share Row */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-border/80 py-4">
              <div className="flex items-center gap-3">
                <SkeletonBlock className="h-[46px] w-[46px] shrink-0 rounded-full" />
                <div>
                  <div className="flex items-center gap-2">
                    <SkeletonBlock className="h-4 w-32" />
                    <SkeletonBlock className="h-3.5 w-14 rounded-full" />
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <SkeletonBlock className="h-3 w-20" />
                    <SkeletonBlock className="h-3 w-24" />
                  </div>
                </div>
              </div>

              {/* Share & Bookmark Actions */}
              <div className="flex items-center gap-2">
                <SkeletonBlock className="h-8 w-24 rounded-full" />
                <SkeletonBlock className="h-8 w-8 rounded-full" />
              </div>
            </div>

            {/* Cover Image */}
            <SkeletonBlock className="mt-8 aspect-[16/9] w-full rounded-2xl shadow-md" />

            {/* Body Content Prose Skeleton */}
            <div className="mt-8 space-y-4">
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-[96%]" />
              <SkeletonBlock className="h-4 w-[98%]" />
              <SkeletonBlock className="h-4 w-[85%]" />

              <SkeletonBlock className="mt-8 h-7 w-1/2" />

              <SkeletonBlock className="mt-4 h-4 w-full" />
              <SkeletonBlock className="h-4 w-[94%]" />
              <SkeletonBlock className="h-4 w-[97%]" />
              <SkeletonBlock className="h-4 w-[70%]" />

              {/* Blockquote Skeleton */}
              <div className="my-6 border-l-2 border-primary/30 pl-4 py-1 space-y-2">
                <SkeletonBlock className="h-4 w-full" />
                <SkeletonBlock className="h-4 w-4/5" />
              </div>

              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-[92%]" />
              <SkeletonBlock className="h-4 w-[60%]" />
            </div>

            {/* Editorial Footer Meta Bar */}
            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border/80 pt-6">
              <div className="flex items-center gap-2">
                <SkeletonBlock className="h-3 w-10" />
                <SkeletonBlock className="h-6 w-24 rounded-full" />
              </div>
              <SkeletonBlock className="h-4 w-20 rounded-full" />
            </div>

            {/* Mobile Related Dispatches */}
            <div className="mt-16 lg:hidden">
              <div className="mb-6 flex items-center justify-between border-b border-border/70 pb-3">
                <SkeletonBlock className="h-5 w-36" />
                <SkeletonBlock className="h-3.5 w-16" />
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/80 bg-surface p-4">
                  <SkeletonBlock className="aspect-[16/9] w-full rounded-xl" />
                  <SkeletonBlock className="mt-3 h-4 w-3/4" />
                  <SkeletonBlock className="mt-2 h-3 w-1/2" />
                </div>
                <div className="rounded-2xl border border-border/80 bg-surface p-4">
                  <SkeletonBlock className="aspect-[16/9] w-full rounded-xl" />
                  <SkeletonBlock className="mt-3 h-4 w-3/4" />
                  <SkeletonBlock className="mt-2 h-3 w-1/2" />
                </div>
              </div>
            </div>

            {/* Comments & Community Dialogue Section */}
            <div className="mt-16 border-t border-border/80 pt-10">
              <div className="flex items-center justify-between mb-6">
                <SkeletonBlock className="h-6 w-36" />
                <SkeletonBlock className="h-4 w-20" />
              </div>

              {/* Comment Input Box */}
              <div className="rounded-2xl border border-border/80 bg-surface p-5">
                <SkeletonBlock className="h-20 w-full rounded-xl" />
                <div className="mt-4 flex justify-end">
                  <SkeletonBlock className="h-9 w-28 rounded-full" />
                </div>
              </div>

              {/* Comment Items */}
              <div className="mt-8 space-y-6">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <SkeletonBlock className="h-9 w-9 shrink-0 rounded-full" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <SkeletonBlock className="h-3.5 w-28" />
                        <SkeletonBlock className="h-3 w-16" />
                      </div>
                      <SkeletonBlock className="h-3.5 w-full" />
                      <SkeletonBlock className="h-3.5 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Sticky Sidebar */}
          <aside className="hidden lg:block lg:w-[340px] lg:shrink-0 space-y-6">
            {/* Card 1: Author Spotlight Showcase */}
            <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs">
              <SkeletonBlock className="h-3 w-28" />
              <div className="mt-4 flex items-center gap-3">
                <SkeletonBlock className="h-12 w-12 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <SkeletonBlock className="h-4 w-28" />
                  <SkeletonBlock className="h-3 w-20" />
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                <SkeletonBlock className="h-3 w-full" />
                <SkeletonBlock className="h-3 w-4/5" />
              </div>
              <div className="mt-5 border-t border-border/60 pt-4">
                <SkeletonBlock className="h-9 w-full rounded-full" />
              </div>
            </div>

            {/* Card 2: Related Curated Dispatches ("Next in Stream") */}
            <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs">
              <div className="mb-4 flex items-center justify-between border-b border-border/70 pb-3">
                <SkeletonBlock className="h-3 w-28" />
                <SkeletonBlock className="h-3 w-12" />
              </div>
              <div className="flex flex-col divide-y divide-border/60">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="py-3.5 first:pt-1 last:pb-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <SkeletonBlock className="h-3 w-6" />
                      <SkeletonBlock className="h-3 w-16" />
                      <SkeletonBlock className="h-3 w-14" />
                    </div>
                    <SkeletonBlock className="h-4 w-full" />
                    <SkeletonBlock className="h-4 w-4/5" />
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
