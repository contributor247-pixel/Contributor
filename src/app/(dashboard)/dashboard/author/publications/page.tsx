import Link from "next/link";
import { BookOpen, Plus, Sparkles, ArrowUpRight, Users, Shield } from "lucide-react";
import { requireVerifiedAuthorForPage } from "@/lib/require-page-auth";
import { getMyPublicationsAction } from "@/lib/actions/publication";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function PublicationsPage() {
  await requireVerifiedAuthorForPage();
  const publications = await getMyPublicationsAction().catch(() => []);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Mastheads</span>
          </div>
          <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-text-heading">
            Publications
          </h1>
          <p className="mt-0.5 text-xs text-text-muted">
            Collective mastheads, multi-author journals, and shared subscription hubs.
          </p>
        </div>

        <Link
          href="/dashboard/author/publications/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-primary-hover hover:shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Publication</span>
        </Link>
      </div>

      {/* 2. Publications List */}
      {publications.length === 0 ? (
        <div className="rounded-2xl border border-border/80 bg-surface p-10 text-center">
          <EmptyState
            icon={BookOpen}
            headline="No Publications Yet"
            description="Create an editorial publication to collaborate with other writers under a shared brand, or accept an invitation to join one."
            cta={{ label: "Create a Publication", href: "/dashboard/author/publications/new" }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {publications.map((p) => (
            <div
              key={p.id}
              className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-surface p-6 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <BookOpen className="h-5 w-5" />
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      p.role === "owner"
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "bg-surface-muted text-text-muted border border-border/60"
                    }`}
                  >
                    {p.role === "owner" ? "Owner" : "Contributor"}
                  </span>
                </div>

                <h3 className="mt-4 font-serif text-lg font-semibold text-text-heading group-hover:text-primary transition-colors">
                  {p.name}
                </h3>
                <p className="mt-1 text-xs text-text-muted">
                  {p.role === "owner"
                    ? "Full administrative ownership over subscriptions & masthead."
                    : "Contributor author with publishing permissions."}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
                <span className="text-xs text-text-muted">Editorial Hub</span>
                {p.role === "owner" ? (
                  <Link
                    href={`/dashboard/author/publications/${p.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <span>Manage Masthead</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                ) : (
                  <Link
                    href={`/publication/${p.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <span>View Page</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
