"use client";

import { useRef, useState } from "react";
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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (value: string) => {
    setQuery(value);
    setMessage(null);
    setError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(value)}`);
      const data = await res.json();
      setResults(data.results ?? []);
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
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search by name or email..."
          className="h-11 w-full max-w-sm rounded-[4px] border border-border-strong px-3 text-sm text-text-body placeholder:text-text-muted focus:border-ink focus:outline-none focus:ring-[3px] focus:ring-[#11111414]"
        />
        {results.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full max-w-sm rounded-[4px] border border-border bg-surface shadow-lg">
            {results.map((candidate) => (
              <li key={candidate.id}>
                <button
                  type="button"
                  onClick={() => handleInvite(candidate)}
                  disabled={isSending}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {candidate.name ?? "Unnamed"} <span className="text-text-muted">({candidate.email})</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {message && <p className="mt-2 text-sm text-success">{message}</p>}
      {error && <p className="mt-2 text-sm text-error">{error}</p>}
    </div>
  );
}
