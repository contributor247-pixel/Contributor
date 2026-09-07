"use client";

import { useState } from "react";
import { ContributorInvite } from "@/components/publication/ContributorInvite";

interface PublicationManagementTabsProps {
  publicationId: string;
  articles: { id: string; title: string; status: string; createdAt: Date }[];
}

export function PublicationManagementTabs({ publicationId, articles }: PublicationManagementTabsProps) {
  const [tab, setTab] = useState<"contributors" | "articles">("contributors");

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
        <ContributorInvite publicationId={publicationId} />
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
