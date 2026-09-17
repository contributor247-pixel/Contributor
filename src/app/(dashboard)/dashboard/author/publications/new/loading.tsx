import { SkeletonBlock } from "@/components/shared/SkeletonBlock";

// This page does two sequential auth checks (requireVerifiedAuthorForPage,
// then requireAuthorPro) before rendering either the create-Publication
// form or the upgrade prompt — a generic form-shaped skeleton covers
// both outcomes reasonably, since which one renders isn't known yet.
export default function NewPublicationLoading() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <SkeletonBlock className="h-3 w-28 rounded-full" />
        <SkeletonBlock className="mt-2 h-8 w-56 rounded-lg" />
      </div>
      <div className="space-y-5 rounded-2xl border border-border/80 bg-surface p-6 shadow-xs sm:p-8">
        <div className="space-y-2">
          <SkeletonBlock className="h-3 w-20" />
          <SkeletonBlock className="h-11 w-full rounded-[4px]" />
        </div>
        <div className="space-y-2">
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="h-24 w-full rounded-[4px]" />
        </div>
        <div className="space-y-2">
          <SkeletonBlock className="h-3 w-28" />
          <SkeletonBlock className="h-32 w-32 rounded-[4px]" />
        </div>
        <SkeletonBlock className="h-11 w-32 rounded-full" />
      </div>
    </div>
  );
}
