"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Edit2, Archive, RotateCcw, RefreshCw } from "lucide-react";
import { renameCategoryAction, setCategoryDeprecatedAction } from "@/lib/actions/admin";
import { useToast } from "@/hooks/use-toast";

interface CategoryRowProps {
  id: string;
  name: string;
  slug: string;
  deprecated: boolean;
}

export function CategoryRow({ id, name, slug, deprecated }: CategoryRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { show } = useToast();

  const handleSave = () => {
    if (!value.trim() || value.trim() === name) {
      setValue(name);
      setIsEditing(false);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await renameCategoryAction(id, value);
      if (!result.success) {
        setError(result.error);
        return;
      }
      show(`Category renamed to "${value.trim()}".`);
      setIsEditing(false);
      router.refresh();
    });
  };

  const handleToggleDeprecated = () => {
    setError(null);
    startTransition(async () => {
      const result = await setCategoryDeprecatedAction(id, !deprecated);
      if (!result.success) {
        setError(result.error);
        return;
      }
      show(deprecated ? `Category "${name}" reactivated.` : `Category "${name}" deprecated.`);
      router.refresh();
    });
  };

  return (
    <tr className="group transition-colors hover:bg-bg-alt/40">
      {/* Category Name & Inline Editor */}
      <td className="py-4 pl-6 pr-4">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") {
                  setValue(name);
                  setIsEditing(false);
                }
              }}
              className="h-8 w-52 rounded-lg border border-border/80 bg-surface px-2.5 text-xs text-text-heading shadow-2xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              aria-label="Save category name"
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 disabled:opacity-60"
            >
              {isPending ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setValue(name);
                setIsEditing(false);
              }}
              aria-label="Cancel edit"
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-bg-alt text-text-muted hover:bg-border/60"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="group/btn inline-flex items-center gap-2 text-left font-semibold text-text-heading hover:text-primary transition-colors"
            >
              <span>{name}</span>
              <Edit2 className="h-3 w-3 opacity-0 text-text-muted transition-opacity group-hover/btn:opacity-100" />
            </button>
          </div>
        )}
      </td>

      {/* Slug */}
      <td className="py-4 px-4 font-mono text-xs text-text-muted">
        <span className="rounded-md bg-bg-alt/70 px-2 py-0.5 border border-border/40">
          /{slug}
        </span>
      </td>

      {/* Status */}
      <td className="py-4 px-4 whitespace-nowrap">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            deprecated
              ? "bg-bg-alt text-text-muted border border-border/80"
              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              deprecated ? "bg-text-muted/60" : "bg-emerald-500 animate-pulse"
            }`}
          />
          {deprecated ? "Deprecated" : "Active"}
        </span>
      </td>

      {/* Actions */}
      <td className="py-4 pl-4 pr-6 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleToggleDeprecated}
            disabled={isPending}
            className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-2xs transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
              deprecated
                ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                : "border border-border/80 bg-surface text-text-muted hover:bg-bg-alt hover:text-text-heading hover:border-border-strong"
            }`}
          >
            {isPending ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : deprecated ? (
              <RotateCcw className="h-3 w-3" />
            ) : (
              <Archive className="h-3 w-3" />
            )}
            {deprecated ? "Reactivate" : "Deprecate"}
          </button>
        </div>
        {error && <p role="alert" className="mt-1 text-xs text-error font-medium">{error}</p>}
      </td>
    </tr>
  );
}
