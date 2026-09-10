import Link from "next/link";
import { BookOpen } from "lucide-react";
import { requireVerifiedAuthorForPage } from "@/lib/require-page-auth";
import { getMyPublicationsAction } from "@/lib/actions/publication";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function PublicationsPage() {
  await requireVerifiedAuthorForPage();
  const publications = await getMyPublicationsAction();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold text-text-heading">Publications</h1>
        <Link
          href="/dashboard/author/publications/new"
          className="inline-flex h-10 items-center rounded-[4px] bg-ink px-4 text-sm font-semibold text-white transition-colors hover:bg-primary"
        >
          New Publication
        </Link>
      </div>

      {publications.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          headline="No Publications yet"
          description="Create a Publication to collaborate with other Authors, or wait for an invite to contribute to someone else's."
          cta={{ label: "Create a Publication", href: "/dashboard/author/publications/new" }}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {publications.map((p) => (
            <li key={p.id} className="flex items-center justify-between rounded-[4px] border border-border-strong p-4">
              <div>
                <p className="font-medium text-text-heading">{p.name}</p>
                <p className="text-xs text-text-muted">{p.role === "owner" ? "Owner" : "Contributor"}</p>
              </div>
              {p.role === "owner" && (
                <Link
                  href={`/dashboard/author/publications/${p.id}`}
                  className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-text-body underline-offset-2 hover:underline"
                >
                  Manage
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
