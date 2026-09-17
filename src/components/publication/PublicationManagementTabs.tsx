"use client";

import { useEffect, useState, useCallback } from "react";
import { ContributorInvite } from "@/components/publication/ContributorInvite";
import { getPublicationContributorsAction, type PublicationContributor } from "@/lib/actions/publication";

interface PublicationManagementTabsProps {
  publicationId: string;
  articles: { id: string; title: string; status: string; createdAt: Date }[];
}

export function PublicationManagementTabs({ publicationId, articles }: PublicationManagementTabsProps) {
  const [tab, setTab] = useState<"contributors" | "articles">("contributors");
  const [contributors, setContributors] = useState<PublicationContributor[] | null>(null);
  // A failed fetch previously fell back to an empty array, which
  // rendered identically to "no one has been invited yet" — a real
  // fetch error (this session has repeatedly hit transient Neon
  // connectivity blips) was indistinguishable from the genuine empty
  // state, with no way to tell the Owner anything was wrong or offer
  // a retry.
  const [fetchError, setFetchError] = useState(false);

  const refetchContributors = useCallback(() => {
    setFetchError(false);
    getPublicationContributorsAction(publicationId)
      .then(setContributors)
      .catch(() => setFetchError(true));
  }, [publicationId]);

  useEffect(() => {
    refetchContributors();
  }, [refetchContributors]);

  return (
    <div>
      <div className="mb-6 flex gap-6 border-b border-border">
        <button
          type="button"
          onClick={() => setTab("contributors")}
          className={
            tab === "contributors"
              ? "border-b-2 border-ink pb-3 text-sm font-semibold text-text-heading"
              : "pb-3 text-sm font-medium text-text-muted"
          }
        >
          Contributors
        </button>
        <button
          type="button"
          onClick={() => setTab("articles")}
          className={
            tab === "articles"
              ? "border-b-2 border-ink pb-3 text-sm font-semibold text-text-heading"
              : "pb-3 text-sm font-medium text-text-muted"
          }
        >
          Articles
        </button>
      </div>

      {tab === "contributors" ? (
        <div className="flex flex-col gap-6">
          <ContributorInvite publicationId={publicationId} onInvited={refetchContributors} />
          <div>
            <p className="mb-2 text-sm font-medium text-text-body">Contributors</p>
            {fetchError ? (
              <div className="flex items-center justify-between gap-3 rounded-[4px] border border-error/30 bg-error/5 px-3 py-2.5 text-sm text-error">
                <span>Couldn&apos;t load contributors. Please try again.</span>
                <button
                  type="button"
                  onClick={refetchContributors}
                  className="shrink-0 font-semibold underline-offset-2 hover:underline"
                >
                  Retry
                </button>
              </div>
            ) : contributors === null ? (
              <p className="text-sm text-text-muted">Loading...</p>
            ) : contributors.length === 0 ? (
              <p className="text-sm text-text-muted">No one has been invited to this Publication yet.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {contributors.map((c) => (
                  <li key={c.inviteId} className="flex items-center justify-between rounded-[4px] border border-border-strong p-3">
                    <div className="min-w-0">
                      <span className="block truncate text-sm font-medium text-text-heading">{c.name ?? "Unnamed"}</span>
                      <span className="block truncate text-xs text-text-muted">{c.email}</span>
                    </div>
                    <span
                      className={
                        c.status === "accepted"
                          ? "shrink-0 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success"
                          : c.status === "declined"
                            ? "shrink-0 rounded-full bg-error/10 px-2.5 py-0.5 text-xs font-medium text-error"
                            : "shrink-0 rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning"
                      }
                    >
                      {c.status === "accepted" ? "Accepted" : c.status === "declined" ? "Declined" : "Pending"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <div>
          {articles.length === 0 ? (
            <p className="text-sm text-text-muted">No articles published into this Publication yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {articles.map((a) => (
                <li key={a.id} className="flex items-center justify-between rounded-[4px] border border-border-strong p-3">
                  <span className="text-sm font-medium text-text-heading">{a.title}</span>
                  <span className="text-xs text-text-muted">{a.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
