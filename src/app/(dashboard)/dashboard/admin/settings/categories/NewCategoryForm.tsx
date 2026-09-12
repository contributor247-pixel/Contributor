"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createCategoryAction } from "@/lib/actions/admin";

export function NewCategoryForm() {
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createCategoryAction(name);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setName("");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 flex flex-col items-start gap-3 sm:flex-row">
      <div className="w-full sm:w-64">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name..."
          className="h-11 w-full rounded-[4px] border border-border-strong px-3 text-sm text-text-body placeholder:text-text-muted focus:border-ink focus:outline-none focus:ring-[3px] focus:ring-[#14141a14]"
        />
        {error && <p className="mt-1 text-xs text-error">{error}</p>}
      </div>
      <button
        type="submit"
        disabled={isPending || !name.trim()}
        className="flex h-11 w-full items-center justify-center gap-1.5 rounded-[4px] bg-ink px-4 text-sm font-semibold text-white transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        {isPending ? "Adding..." : "Add Category"}
      </button>
    </form>
  );
}
