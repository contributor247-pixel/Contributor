"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

export function SearchBar({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `?q=${encodeURIComponent(trimmed)}` : "?");
  };

  const handleClear = () => {
    setQuery("");
    router.push("?");
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-sm">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name or email..."
        className="h-10 w-full rounded-xl border border-border/80 bg-surface pl-10 pr-9 text-xs sm:text-sm text-text-heading placeholder:text-text-muted shadow-2xs transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-text-muted hover:bg-bg-alt hover:text-text-heading"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </form>
  );
}
