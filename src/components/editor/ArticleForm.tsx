"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings2 } from "lucide-react";
import {
  createArticleAction,
  updateArticleAction,
  searchAuthorsAction,
  getPremiumEligibilityAction,
  type CoAuthorCandidate,
  type PremiumEligibility,
} from "@/lib/actions/article";
import { getSelectablePublicationsAction, type SelectablePublication } from "@/lib/actions/publication";
import { articleSchema } from "@/lib/validators/article";
import { useToast } from "@/hooks/use-toast";
import { EditorCanvas } from "./EditorCanvas";
import { PublishSettingsDrawer } from "./PublishSettingsDrawer";

interface Category {
  id: string;
  name: string;
}

interface ArticleFormProps {
  mode: "create" | "edit";
  articleId?: string;
  categories: Category[];
  initialValues?: {
    title: string;
    body: string;
    categoryId: string;
    tags: string[];
    coAuthors: CoAuthorCandidate[];
    coverImageUrl: string | null;
    status: "draft" | "published";
    isPremium: boolean;
    priceCents: number | null;
    publicationId: string | null;
  };
}

const MAX_COVER_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB, base64 stub only

export function ArticleForm({ mode, articleId, categories, initialValues }: ArticleFormProps) {
  const router = useRouter();
  const { show } = useToast();
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [body, setBody] = useState(initialValues?.body ?? "");
  const [categoryId, setCategoryId] = useState(initialValues?.categoryId ?? "");
  const [tags, setTags] = useState<string[]>(initialValues?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [coAuthors, setCoAuthors] = useState<CoAuthorCandidate[]>(initialValues?.coAuthors ?? []);
  const [coAuthorQuery, setCoAuthorQuery] = useState("");
  const [coAuthorResults, setCoAuthorResults] = useState<CoAuthorCandidate[]>([]);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(initialValues?.coverImageUrl ?? null);
  const [coverImageError, setCoverImageError] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(initialValues?.isPremium ?? false);
  const [priceInput, setPriceInput] = useState(
    initialValues?.priceCents != null ? (initialValues.priceCents / 100).toFixed(2) : ""
  );
  const [eligibility, setEligibility] = useState<PremiumEligibility | null>(null);
  const [publicationId, setPublicationId] = useState(initialValues?.publicationId ?? "");
  const [selectablePublications, setSelectablePublications] = useState<SelectablePublication[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<"draft" | "published" | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Unhandled here previously — a transient failure (network blip,
    // slow cold start) left an unhandled promise rejection instead of
    // just degrading gracefully to "no Premium eligibility info yet" /
    // "no Publications to choose from," which is what the UI already
    // does correctly when these are still null/empty.
    getPremiumEligibilityAction().then(setEligibility).catch(() => {});
    getSelectablePublicationsAction().then(setSelectablePublications).catch(() => {});
  }, []);

  const addTag = (raw: string) => {
    const value = raw.trim();
    if (!value) return;
    if (tags.includes(value)) {
      setTagInput("");
      return;
    }
    setTags((prev) => [...prev, value]);
    setTagInput("");
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const handleCoAuthorSearch = useCallback((value: string) => {
    setCoAuthorQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!value.trim()) {
      setCoAuthorResults([]);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      const results = await searchAuthorsAction(value);
      setCoAuthorResults(results.filter((r) => !coAuthors.some((c) => c.id === r.id)));
    }, 300);
  }, [coAuthors]);

  const addCoAuthor = (candidate: CoAuthorCandidate) => {
    setCoAuthors((prev) => [...prev, candidate]);
    setCoAuthorResults([]);
    setCoAuthorQuery("");
    // Co-authored articles can't be Premium (see buildPayload below) —
    // this used to drop silently at save time with no explanation, so
    // the author would publish a co-authored article as free after
    // having set a price, with no idea why.
    if (isPremium) {
      show("This article is now co-authored, so its Premium price has been removed — it will publish as free.", "warning");
    }
  };

  const removeCoAuthor = (id: string) => setCoAuthors((prev) => prev.filter((c) => c.id !== id));

  const handleIsPremiumChange = (checked: boolean) => {
    setIsPremium(checked);
    // Prefill the price field with the admin-configured default when
    // switching Premium on for the first time — only if the field is
    // still empty, so this never overwrites a price the author already
    // typed or an existing article's saved price (initialValues sets
    // priceInput directly, bypassing this handler entirely).
    if (checked && !priceInput && eligibility) {
      setPriceInput((eligibility.defaultPriceCents / 100).toFixed(2));
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCoverImageError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setCoverImageError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_COVER_IMAGE_BYTES) {
      setCoverImageError("Image must be under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setCoverImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const priceCents = (() => {
    const parsed = Math.round(parseFloat(priceInput) * 100);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  })();

  const buildPayload = (status: "draft" | "published") => ({
    title,
    body,
    categoryId,
    tags,
    coAuthorIds: coAuthors.map((c) => c.id),
    coverImageUrl,
    status,
    isPremium: isPremium && coAuthors.length === 0,
    priceCents: isPremium && coAuthors.length === 0 ? priceCents : null,
    publicationId: publicationId || null,
  });

  const handleSubmit = async (status: "draft" | "published") => {
    setFormError(null);
    // coverImageError only ever blocked coverImageUrl from being set
    // (see handleCoverImageChange above) — it never actually stopped
    // submission, so choosing an oversized cover image and clicking
    // Save Draft/Publish anyway silently saved with no cover instead of
    // surfacing the problem again.
    if (coverImageError) {
      setIsDrawerOpen(true);
      return;
    }
    // Premium + an invalid/out-of-range price previously fell through
    // silently: resolvePremiumFields on the server just downgrades the
    // article to free with no error, so the author would publish a
    // "Premium" article that saved as free with no warning at all.
    if (isPremium && coAuthors.length === 0) {
      if (priceCents === null) {
        setErrors({ priceCents: "Enter a price to publish this as a Premium article." });
        setIsDrawerOpen(true);
        return;
      }
      if (eligibility && (priceCents < eligibility.minPriceCents || priceCents > eligibility.maxPriceCents)) {
        setErrors({
          priceCents: `Price must be between $${(eligibility.minPriceCents / 100).toFixed(2)} and $${(eligibility.maxPriceCents / 100).toFixed(2)}.`,
        });
        setIsDrawerOpen(true);
        return;
      }
    }
    const payload = buildPayload(status);
    const parsed = articleSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString();
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      setIsDrawerOpen(true);
      return;
    }
    setErrors({});
    setIsSubmitting(status);
    // Wrapped in try/catch because a Server Action call can throw before
    // ever reaching createArticleAction's own { success, error } return —
    // e.g. Next.js's request body size limit (real cover/inline images
    // are base64-encoded directly into this request; see next.config.ts)
    // rejects the request at the framework level with an uncaught error.
    // Without this, that error was silently leaving isSubmitting stuck
    // (the button frozen on "Publishing...") with zero feedback that the
    // article was never saved.
    try {
      const result =
        mode === "create"
          ? await createArticleAction(parsed.data)
          : await updateArticleAction(articleId!, parsed.data);
      if (!result.success) {
        setFormError(result.error);
        return;
      }
      show(status === "published" ? "Article published." : "Draft saved.");
      router.push("/dashboard/author/articles");
      router.refresh();
    } catch {
      setFormError("Something went wrong while saving. If your images are large, try a smaller file and try again.");
    } finally {
      setIsSubmitting(null);
    }
  };

  return (
    <div>
      <div className="sticky top-0 z-20 -mx-4 mb-8 flex items-center justify-between gap-2 border-b border-border bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <p className="hidden text-xs font-semibold uppercase tracking-[0.15em] text-text-muted sm:block">
          {mode === "create" ? "New Article" : "Edit Article"}
        </p>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Publish settings"
            className="flex h-11 items-center gap-2 rounded-[4px] border border-border-strong px-2.5 text-sm font-medium text-text-body transition-colors hover:bg-bg-muted sm:h-10 sm:px-3.5"
          >
            <Settings2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Publish settings</span>
          </button>
          <button
            type="button"
            onClick={() => handleSubmit("draft")}
            disabled={isSubmitting !== null || categories.length === 0}
            className="h-11 rounded-[4px] border border-ink px-3 text-sm font-semibold text-ink transition-colors hover:bg-bg-muted disabled:cursor-not-allowed disabled:border-[#D3D0CA] disabled:text-[#B0AFAA] sm:h-10 sm:px-4"
          >
            {isSubmitting === "draft" ? "Saving..." : "Save Draft"}
          </button>
          <button
            type="button"
            onClick={() => handleSubmit("published")}
            disabled={isSubmitting !== null || categories.length === 0}
            className="h-11 rounded-[4px] bg-ink px-3 text-sm font-semibold text-white transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:bg-[#C9C9C9] disabled:text-[#8A8A8A] sm:h-10 sm:px-4"
          >
            {isSubmitting === "published" ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>

      {formError && (
        <p role="alert" className="mx-auto mb-4 max-w-[720px] text-sm text-error">{formError}</p>
      )}
      {(errors.title || errors.body || errors.categoryId || errors.tags || errors.priceCents) && (
        <div role="alert" className="mx-auto mb-4 max-w-[720px] rounded-[4px] border border-error/30 bg-error/5 p-3 text-sm text-error">
          {errors.title && <p>{errors.title}</p>}
          {errors.body && <p>{errors.body}</p>}
          {errors.categoryId && <p>{errors.categoryId} — open Publish settings to choose one.</p>}
          {errors.tags && <p>{errors.tags}</p>}
          {errors.priceCents && <p>{errors.priceCents}</p>}
        </div>
      )}

      <EditorCanvas title={title} onTitleChange={setTitle} content={body} onContentChange={setBody} />

      <PublishSettingsDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        categories={categories}
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
        categoryError={errors.categoryId}
        selectablePublications={selectablePublications}
        publicationId={publicationId}
        onPublicationChange={setPublicationId}
        tags={tags}
        tagInput={tagInput}
        onTagInputChange={setTagInput}
        onTagKeyDown={handleTagKeyDown}
        onTagBlur={() => addTag(tagInput)}
        onRemoveTag={removeTag}
        tagsError={errors.tags}
        coverImageUrl={coverImageUrl}
        onCoverImageChange={handleCoverImageChange}
        coverImageError={coverImageError}
        eligibility={eligibility}
        isPremium={isPremium}
        onIsPremiumChange={handleIsPremiumChange}
        priceInput={priceInput}
        onPriceInputChange={setPriceInput}
        priceError={errors.priceCents}
        coAuthors={coAuthors}
        coAuthorQuery={coAuthorQuery}
        onCoAuthorSearch={handleCoAuthorSearch}
        coAuthorResults={coAuthorResults}
        onAddCoAuthor={addCoAuthor}
        onRemoveCoAuthor={removeCoAuthor}
      />
    </div>
  );
}
