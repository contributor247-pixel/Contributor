"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createPublicationAction } from "@/lib/actions/publication";
import { publicationSchema } from "@/lib/validators/publication";

const MAX_COVER_IMAGE_BYTES = 2 * 1024 * 1024;

export function PublicationForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [coverImageError, setCoverImageError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const payload = { name, description: description || null, coverImageUrl };
    const parsed = publicationSchema.safeParse(payload);
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
    setIsSubmitting(true);
    const result = await createPublicationAction(parsed.data);
    setIsSubmitting(false);
    if (!result.success) {
      setFormError(result.error);
      return;
    }
    router.push(`/dashboard/author/publications/${result.publicationId}`);
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 font-serif text-2xl font-semibold text-text-heading">New Publication</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-text-body">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Publication name..."
            className="h-12 w-full rounded-[4px] border border-border-strong px-4 text-text-heading placeholder:text-text-muted focus:border-ink focus:outline-none focus:ring-[3px] focus:ring-[#11111414]"
          />
          {errors.name && <p className="mt-1 text-sm text-error">{errors.name}</p>}
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-text-body">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this Publication about?"
            rows={4}
            className="w-full rounded-[4px] border border-border-strong px-4 py-3 text-text-body placeholder:text-text-muted focus:border-ink focus:outline-none focus:ring-[3px] focus:ring-[#11111414]"
          />
          {errors.description && <p className="mt-1 text-sm text-error">{errors.description}</p>}
        </div>

        <div className="mb-6">
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
            <img src={coverImageUrl} alt="Cover preview" className="mt-3 h-40 w-full rounded-[4px] object-cover" />
          )}
        </div>

        {formError && <p className="mb-4 text-sm text-error">{formError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-11 rounded-[4px] bg-ink px-6 text-sm font-semibold text-white transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating..." : "Create Publication"}
        </button>
      </form>
    </div>
  );
}
