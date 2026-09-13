"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { renameCategoryAction, setCategoryDeprecatedAction } from "@/lib/actions/admin";

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

  const handleSave = () => {
    if (value.trim() === name) {
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
      router.refresh();
    });
  };

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3 font-medium text-text-heading">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
              className="h-9 w-48 rounded-[4px] border border-border-strong px-2 text-sm text-text-heading focus:border-ink focus:outline-none focus:ring-[3px] focus:ring-[#14141a14]"
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="inline-flex min-h-11 items-center px-2 text-xs font-semibold text-success hover:underline disabled:opacity-60"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setValue(name);
                setIsEditing(false);
              }}
              className="inline-flex min-h-11 items-center px-2 text-xs text-text-muted hover:underline"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="-mx-2 inline-flex min-h-11 items-center px-2 text-left hover:underline"
          >
            {name}
          </button>
        )}
      </td>
      <td className="px-4 py-3 text-text-muted">{slug}</td>
      <td className="px-4 py-3">
        <span
          className={
            deprecated
              ? "rounded-full bg-bg-muted px-2 py-0.5 text-xs font-medium text-text-muted"
              : "rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success"
          }
        >
          {deprecated ? "Deprecated" : "Active"}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          onClick={handleToggleDeprecated}
          disabled={isPending}
          className="inline-flex min-h-11 items-center px-2 text-text-body underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Working..." : deprecated ? "Reactivate" : "Deprecate"}
        </button>
        {error && <p role="alert" className="mt-1 text-xs text-error">{error}</p>}
      </td>
    </tr>
  );
}
