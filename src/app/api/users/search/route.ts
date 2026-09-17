import { NextResponse } from "next/server";
import { and, eq, ilike, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "../../../../../drizzle/schema/index";
import { requireAuth, UnauthenticatedError, SuspendedError } from "@/lib/permissions";

export async function GET(request: Request) {
  try {
    await requireAuth();
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    if (err instanceof SuspendedError) {
      return NextResponse.json({ error: "Your account has been suspended." }, { status: 403 });
    }
    throw err;
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json({ results: [] });

  // Was previously fetching an arbitrary first 50 authors/admins (no
  // ORDER BY) and filtering in memory — on a platform with more than
  // 50 eligible users, a search for someone outside that slice would
  // never find them, even with an exact match. Filtering in the query
  // itself (mirroring searchArticles' ILIKE pattern) makes the search
  // correct regardless of how many eligible users exist.
  // Only role "author" — this backs the Publication contributor-invite
  // search (ContributorInvite.tsx). Admin is excluded from being
  // invited as a contributor (docs/00_ScopeDocument.md Section 3);
  // surfacing one here would let an Owner send an invite the admin
  // could never accept (respondToInviteAction requires role "author").
  const pattern = `%${q}%`;
  const results = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(
      and(
        eq(users.role, "author"),
        eq(users.status, "active"),
        or(ilike(users.name, pattern), ilike(users.email, pattern))
      )
    )
    .limit(10);

  return NextResponse.json({ results });
}
