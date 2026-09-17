"use client";

import { useRef, useState } from "react";
import { Search, UserPlus } from "lucide-react";
import { sendInviteAction, type ContributorCandidate } from "@/lib/actions/publication";

interface ContributorInviteProps {
  publicationId: string;
}

export function ContributorInvite({ publicationId }: ContributorInviteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ContributorCandidate[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (value: string) => {
    setQuery(value);
    setMessage(null);
    setError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(value)}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data?.error ?? "Search failed. Please try again.");
          setResults([]);
          return;
        }
        setResults(data.results ?? []);
      } catch {
        setError("Search failed. Please try again.");
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const handleInvite = async (candidate: ContributorCandidate) => {
    setIsSending(true);
    setMessage(null);
    setError(null);
    const result = await sendInviteAction(publicationId, candidate.id);
    setIsSending(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setMessage(`Invited ${candidate.name ?? candidate.email}.`);
    setQuery("");
    setResults([]);
  };

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-text-body">Invite a contributor</label>
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search by name or email..."
          className="h-11 w-full rounded-[4px] border border-border-strong pl-10 pr-3 text-sm text-text-body placeholder:text-text-muted transition-colors focus:border-ink focus:outline-none focus:ring-[3px] focus:ring-[#14141a14]"
        />
        {results.length > 0 && (
          <ul className="absolute z-10 mt-1.5 w-full overflow-hidden rounded-[4px] border border-border bg-surface shadow-lg">
            {results.map((candidate) => (
              <li key={candidate.id}>
                <button
                  type="button"
                  onClick={() => handleInvite(candidate)}
                  disabled={isSending}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-white">
                    {(candidate.name ?? candidate.email).charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-text-heading">{candidate.name ?? "Unnamed"}</span>
                    <span className="block truncate text-xs text-text-muted">{candidate.email}</span>
                  </span>
                  <UserPlus className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {isSearching && <p className="mt-2 text-xs text-text-muted">Searching...</p>}
      {message && <p role="status" className="mt-2 text-sm text-success">{message}</p>}
      {error && <p role="alert" className="mt-2 text-sm text-error">{error}</p>}
    </div>
  );
}
