"use client";

import { useRef } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import type { CoAuthorCandidate, PremiumEligibility } from "@/lib/actions/article";
import type { SelectablePublication } from "@/lib/actions/publication";

interface Category {
  id: string;
  name: string;
}

interface PublishSettingsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  categoryId: string;
  onCategoryChange: (id: string) => void;
  categoryError?: string;
  selectablePublications: SelectablePublication[];
  publicationId: string;
  onPublicationChange: (id: string) => void;
  tags: string[];
  tagInput: string;
  onTagInputChange: (value: string) => void;
  onTagKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onTagBlur: () => void;
  onRemoveTag: (tag: string) => void;
  tagsError?: string;
  coverImageUrl: string | null;
  onCoverImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  coverImageError: string | null;
  eligibility: PremiumEligibility | null;
  isPremium: boolean;
  onIsPremiumChange: (value: boolean) => void;
  priceInput: string;
  onPriceInputChange: (value: string) => void;
  priceError?: string;
  coAuthors: CoAuthorCandidate[];
  coAuthorQuery: string;
  onCoAuthorSearch: (value: string) => void;
  coAuthorResults: CoAuthorCandidate[];
  onAddCoAuthor: (candidate: CoAuthorCandidate) => void;
  onRemoveCoAuthor: (id: string) => void;
}

// The publish-settings surface (category, tags, cover image, Premium
// toggle, co-authors) lives in a slide-in drawer rather than inline in
// the writing canvas, per Step 12's confirmed UX — the editor itself
// stays the visual focus and this stays out of the way until opened.
export function PublishSettingsDrawer(props: PublishSettingsDrawerProps) {
  const prefersReducedMotion = useReducedMotion();
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <DialogPrimitive.Root open={props.open} onOpenChange={props.onOpenChange}>
      <AnimatePresence>
        {props.open && (
          <DialogPrimitive.Portal keepMounted>
            <DialogPrimitive.Backdrop
              render={
                <motion.div
                  className="fixed inset-0 z-50 bg-overlay-scrim"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0.01 : 0.15 }}
                />
              }
            />
            <DialogPrimitive.Popup
              aria-describedby={undefined}
              render={
                <motion.div
                  className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl outline-none"
                  initial={{ x: prefersReducedMotion ? 0 : "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: prefersReducedMotion ? 0 : "100%" }}
                  transition={{ duration: prefersReducedMotion ? 0.01 : 0.22, ease: [0.22, 1, 0.36, 1] }}
                />
              }
            >
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <DialogPrimitive.Title className="font-serif text-lg font-semibold text-text-heading">
                  Publish settings
                </DialogPrimitive.Title>
                <DialogPrimitive.Close
                  aria-label="Close"
                  className="flex h-11 w-11 items-center justify-center rounded-[4px] text-text-muted transition-colors hover:bg-bg-muted hover:text-text-body lg:h-9 lg:w-9"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </DialogPrimitive.Close>
              </div>

              <div className="flex-1 px-6 py-5">
                <div className="mb-5">
                  <label className="mb-1 block text-sm font-medium text-text-body">Category</label>
                  {props.categories.length === 0 ? (
                    <p className="text-sm text-warning">
                      No categories exist yet — an Admin needs to create at least one before articles can be
                      published.
                    </p>
                  ) : (
                    <select
                      value={props.categoryId}
                      onChange={(e) => props.onCategoryChange(e.target.value)}
                      className="h-11 w-full rounded-[4px] border border-border-strong bg-surface px-3 text-sm text-text-heading focus:border-ink focus:outline-none focus:ring-[3px] focus:ring-[#14141a14]"
                    >
                      <option value="">Select a category...</option>
                      {props.categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {props.categoryError && <p role="alert" className="mt-1 text-sm text-error">{props.categoryError}</p>}
                </div>

                {props.selectablePublications.length > 0 && (
                  <div className="mb-5">
                    <label className="mb-1 block text-sm font-medium text-text-body">Publication (optional)</label>
                    <select
                      value={props.publicationId}
                      onChange={(e) => props.onPublicationChange(e.target.value)}
                      className="h-11 w-full rounded-[4px] border border-border-strong bg-surface px-3 text-sm text-text-heading focus:border-ink focus:outline-none focus:ring-[3px] focus:ring-[#14141a14]"
                    >
                      <option value="">Standalone (not part of a Publication)</option>
                      {props.selectablePublications.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="mb-5">
                  <label className="mb-1 block text-sm font-medium text-text-body">Tags</label>
                  <div className="flex flex-wrap items-center gap-2 rounded-[4px] border border-border-strong px-3 py-2 focus-within:border-ink focus-within:ring-[3px] focus-within:ring-[#14141a14]">
                    {props.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 rounded-full border border-border-strong px-3 py-1 text-xs text-text-body"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => props.onRemoveTag(tag)}
                          aria-label={`Remove tag ${tag}`}
                          className="-my-2 -mr-2 p-2 text-text-muted hover:text-error"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={props.tagInput}
                      onChange={(e) => props.onTagInputChange(e.target.value)}
                      onKeyDown={props.onTagKeyDown}
                      onBlur={props.onTagBlur}
                      placeholder={props.tags.length === 0 ? "Add tags, press Enter..." : ""}
                      className="min-w-[100px] flex-1 border-none bg-transparent text-sm text-text-body placeholder:text-text-muted focus:outline-none"
                    />
                  </div>
                  {props.tagsError && <p role="alert" className="mt-1 text-sm text-error">{props.tagsError}</p>}
                </div>

                <div className="mb-5">
                  <label className="mb-1 block text-sm font-medium text-text-body">Cover Image</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={props.onCoverImageChange}
                    className="block w-full text-sm text-text-body file:mr-4 file:rounded-[4px] file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary"
                  />
                  {props.coverImageError && <p role="alert" className="mt-1 text-sm text-error">{props.coverImageError}</p>}
                  {props.coverImageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element -- base64 data URLs aren't supported by next/image's optimizer
                    <img
                      src={props.coverImageUrl}
                      alt="Cover preview"
                      className="mt-3 h-32 w-full rounded-[4px] object-cover"
                    />
                  )}
                </div>

                {props.eligibility?.isAuthorPro && props.coAuthors.length === 0 && (
                  <div className="mb-5 rounded-[4px] border border-border-strong p-4">
                    <label className="flex items-center gap-2 text-sm font-medium text-text-body">
                      <input
                        type="checkbox"
                        checked={props.isPremium}
                        onChange={(e) => props.onIsPremiumChange(e.target.checked)}
                        className="h-4 w-4 rounded border-border-strong"
                      />
                      Premium article
                    </label>
                    {props.isPremium && (
                      <div className="mt-3">
                        <label className="mb-1 block text-sm font-medium text-text-body">
                          Price (USD, ${(props.eligibility.minPriceCents / 100).toFixed(2)}–$
                          {(props.eligibility.maxPriceCents / 100).toFixed(2)})
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min={props.eligibility.minPriceCents / 100}
                          max={props.eligibility.maxPriceCents / 100}
                          value={props.priceInput}
                          onChange={(e) => props.onPriceInputChange(e.target.value)}
                          placeholder={(props.eligibility.defaultPriceCents / 100).toFixed(2)}
                          className="h-11 w-40 rounded-[4px] border border-border-strong px-3 text-sm text-text-body focus:border-ink focus:outline-none focus:ring-[3px] focus:ring-[#14141a14]"
                        />
                        {props.priceError && <p role="alert" className="mt-1 text-sm text-error">{props.priceError}</p>}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-sm font-medium text-text-body">Co-authors (joint authorship)</label>
                  <p className="mb-2 text-xs text-text-muted">
                    Jointly authored articles are always free, regardless of any co-author&apos;s AuthorPro status.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {props.coAuthors.map((c) => (
                      <span
                        key={c.id}
                        className="flex items-center gap-1 rounded-full border border-border-strong px-3 py-1 text-xs text-text-body"
                      >
                        {c.name ?? c.email}
                        <button
                          type="button"
                          onClick={() => props.onRemoveCoAuthor(c.id)}
                          aria-label={`Remove co-author ${c.name ?? c.email}`}
                          className="-my-2 -mr-2 p-2 text-text-muted hover:text-error"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="relative mt-2">
                    <input
                      type="text"
                      value={props.coAuthorQuery}
                      onChange={(e) => props.onCoAuthorSearch(e.target.value)}
                      placeholder="Search by name or email..."
                      className="h-11 w-full rounded-[4px] border border-border-strong px-3 text-sm text-text-body placeholder:text-text-muted focus:border-ink focus:outline-none focus:ring-[3px] focus:ring-[#14141a14]"
                    />
                    {props.coAuthorResults.length > 0 && (
                      <ul className="absolute z-10 mt-1 w-full rounded-[4px] border border-border bg-surface shadow-lg">
                        {props.coAuthorResults.map((candidate) => (
                          <li key={candidate.id}>
                            <button
                              type="button"
                              onClick={() => props.onAddCoAuthor(candidate)}
                              className="block w-full px-3 py-2 text-left text-sm hover:bg-bg-muted"
                            >
                              {candidate.name ?? "Unnamed"}{" "}
                              <span className="text-text-muted">({candidate.email})</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </DialogPrimitive.Popup>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
