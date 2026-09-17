"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Tag, RefreshCw } from "lucide-react";
import { createCategoryAction } from "@/lib/actions/admin";
import { useToast } from "@/hooks/use-toast";

export function NewCategoryForm() {
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { show } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setError(null);
    startTransition(async () => {
      const result = await createCategoryAction(name);
      if (!result.success) {
        setError(result.error);
        return;
      }
      show(`Category "${name.trim()}" created successfully.`);
      setName("");
      router.refresh();
    });
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs">
      <div className="mb-4">
        <h2 className="font-serif text-lg font-bold text-text-heading">
          Create New Category
        </h2>
        <p className="text-xs text-text-muted">
          Add topics to categorize stories and enhance reader discovery across the publication network.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-start gap-3">
        <div className="relative w-full sm:max-w-md">
          <Tag className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Artificial Intelligence, Climate, Culture"
            className="h-10 w-full rounded-xl border border-border/80 bg-bg-alt/40 pl-10 pr-3 text-xs sm:text-sm text-text-heading placeholder:text-text-muted shadow-2xs transition-all focus:border-primary focus:bg-surface focus:outline-none focus:ring-4 focus:ring-primary/10"
          />
          {error && <p role="alert" className="mt-1.5 text-xs text-error font-medium">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={isPending || !name.trim()}
          className="inline-flex h-10 w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-ink px-5 text-xs font-semibold text-white shadow-2xs transition-all hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
          {isPending ? "Creating..." : "Add Category"}
        </button>
      </form>
    </div>
  );
}
