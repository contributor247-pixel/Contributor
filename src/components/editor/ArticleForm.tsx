"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getPremiumEligibilityAction().then(setEligibility);
    getSelectablePublicationsAction().then(setSelectablePublications);
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
  };

  const removeCoAuthor = (id: string) => setCoAuthors((prev) => prev.filter((c) => c.id !== id));

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
    const payload = buildPayload(status);
    const parsed = articleSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString();
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(status);
    const result =
      mode === "create"
        ? await createArticleAction(parsed.data)
        : await updateArticleAction(articleId!, parsed.data);
    setIsSubmitting(null);
    if (!result.success) {
      setFormError(result.error);
      return;
    }
    router.push("/dashboard/author/articles");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 font-serif text-2xl font-semibold text-text-heading">
        {mode === "create" ? "New Article" : "Edit Article"}
      </h1>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-text-body">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Article title..."
          className="h-12 w-full rounded-[4px] border border-border-strong px-4 text-text-heading placeholder:text-text-muted focus:border-ink focus:outline-none focus:ring-[3px] focus:ring-[#11111414]"
        />
        {errors.title && <p className="mt-1 text-sm text-error">{errors.title}</p>}
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-text-body">Body</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Tell your story..."
          rows={14}
          className="w-full rounded-[4px] border border-border-strong px-4 py-3 text-text-body placeholder:text-text-muted focus:border-ink focus:outline-none focus:ring-[3px] focus:ring-[#11111414]"
        />
        <p className="mt-1 text-xs text-text-muted">
          Plain text for now — the full Medium-style rich-text editor is built in Step 12.
        </p>
        {errors.body && <p className="mt-1 text-sm text-error">{errors.body}</p>}
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-text-body">Category</label>
        {categories.length === 0 ? (
          <p className="text-sm text-warning">
            No categories exist yet — an Admin needs to create at least one before articles can be published.
          </p>
        ) : (
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="h-12 w-full rounded-[4px] border border-border-strong bg-surface px-4 text-text-heading focus:border-ink focus:outline-none focus:ring-[3px] focus:ring-[#11111414]"
          >
            <option value="">Select a category...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
        {errors.categoryId && <p className="mt-1 text-sm text-error">{errors.categoryId}</p>}
      </div>

      {selectablePublications.length > 0 && (
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-text-body">Publication (optional)</label>
          <select
            value={publicationId}
            onChange={(e) => setPublicationId(e.target.value)}
            className="h-12 w-full rounded-[4px] border border-border-strong bg-surface px-4 text-text-heading focus:border-ink focus:outline-none focus:ring-[3px] focus:ring-[#11111414]"
          >
            <option value="">Standalone (not part of a Publication)</option>
            {selectablePublications.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-text-body">Tags</label>
        <div className="flex flex-wrap items-center gap-2 rounded-[4px] border border-border-strong px-3 py-2 focus-within:border-ink focus-within:ring-[3px] focus-within:ring-[#11111414]">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-full border border-border-strong px-3 py-1 text-xs text-text-body"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                aria-label={`Remove tag ${tag}`}
                className="text-text-muted hover:text-error"
              >
                &times;
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onBlur={() => addTag(tagInput)}
            placeholder={tags.length === 0 ? "Add tags, press Enter..." : ""}
            className="min-w-[120px] flex-1 border-none bg-transparent text-sm text-text-body placeholder:text-text-muted focus:outline-none"
          />
        </div>
        {errors.tags && <p className="mt-1 text-sm text-error">{errors.tags}</p>}
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-text-body">Cover Image</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleCoverImageChange}
          className="block w-full text-sm text-text-body file:mr-4 file:rounded-[4px] file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary"
        />
        {coverImageError && <p className="mt-1 text-sm text-error">{coverImageError}</p>}
        {coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- base64 data URLs aren't supported by next/image's optimizer
          <img
            src={coverImageUrl}
            alt="Cover preview"
            className="mt-3 h-40 w-full rounded-[4px] object-cover"
          />
        )}
      </div>

      {eligibility?.isAuthorPro && coAuthors.length === 0 && (
        <div className="mb-6 rounded-[4px] border border-border-strong p-4">
          <label className="flex items-center gap-2 text-sm font-medium text-text-body">
            <input
              type="checkbox"
              checked={isPremium}
              onChange={(e) => setIsPremium(e.target.checked)}
              className="h-4 w-4 rounded border-border-strong"
            />
            Premium article
          </label>
          {isPremium && (
            <div className="mt-3">
              <label className="mb-1 block text-sm font-medium text-text-body">
                Price (USD, ${(eligibility.minPriceCents / 100).toFixed(2)}–$
                {(eligibility.maxPriceCents / 100).toFixed(2)})
              </label>
              <input
                type="number"
                step="0.01"
                min={eligibility.minPriceCents / 100}
                max={eligibility.maxPriceCents / 100}
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                placeholder="4.99"
                className="h-11 w-40 rounded-[4px] border border-border-strong px-3 text-sm text-text-body focus:border-ink focus:outline-none focus:ring-[3px] focus:ring-[#11111414]"
              />
              {errors.priceCents && <p className="mt-1 text-sm text-error">{errors.priceCents}</p>}
            </div>
          )}
        </div>
      )}

      <div className="mb-6">
        <label className="mb-1 block text-sm font-medium text-text-body">Co-authors (joint authorship)</label>
        <p className="mb-2 text-xs text-text-muted">
          Jointly authored articles are always free, regardless of any co-author&apos;s AuthorPro status.
        </p>
        <div className="flex flex-wrap gap-2">
          {coAuthors.map((c) => (
            <span
              key={c.id}
              className="flex items-center gap-1 rounded-full border border-border-strong px-3 py-1 text-xs text-text-body"
            >
              {c.name ?? c.email}
              <button
                type="button"
                onClick={() => removeCoAuthor(c.id)}
                aria-label={`Remove co-author ${c.name ?? c.email}`}
                className="text-text-muted hover:text-error"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
        <div className="relative mt-2">
          <input
            type="text"
            value={coAuthorQuery}
            onChange={(e) => handleCoAuthorSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="h-11 w-full rounded-[4px] border border-border-strong px-3 text-sm text-text-body placeholder:text-text-muted focus:border-ink focus:outline-none focus:ring-[3px] focus:ring-[#11111414]"
          />
          {coAuthorResults.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full rounded-[4px] border border-border bg-surface shadow-lg">
              {coAuthorResults.map((candidate) => (
                <li key={candidate.id}>
                  <button
                    type="button"
                    onClick={() => addCoAuthor(candidate)}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-bg-muted"
                  >
                    {candidate.name ?? "Unnamed"} <span className="text-text-muted">({candidate.email})</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {formError && <p className="mb-4 text-sm text-error">{formError}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => handleSubmit("published")}
          disabled={isSubmitting !== null || categories.length === 0}
          className="h-11 flex-1 rounded-[4px] bg-ink text-sm font-semibold text-white transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:bg-[#C9C9C9] disabled:text-[#8A8A8A]"
        >
          {isSubmitting === "published" ? "Publishing..." : "Publish"}
        </button>
        <button
          type="button"
          onClick={() => handleSubmit("draft")}
          disabled={isSubmitting !== null || categories.length === 0}
          className="h-11 flex-1 rounded-[4px] border border-ink text-sm font-semibold text-ink transition-colors hover:bg-bg-muted disabled:cursor-not-allowed disabled:border-[#D3D0CA] disabled:text-[#B0AFAA]"
        >
          {isSubmitting === "draft" ? "Saving..." : "Save Draft"}
        </button>
      </div>
    </div>
  );
}
