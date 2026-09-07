import { NextResponse } from "next/server";
import { inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "../../../../../drizzle/schema/index";
import { requireAuth, UnauthenticatedError } from "@/lib/permissions";

export async function GET(request: Request) {
  try {
    await requireAuth();
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    throw err;
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json({ results: [] });

  const rows = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role, status: users.status })
    .from(users)
    .where(inArray(users.role, ["author", "admin"]))
    .limit(50);

  const needle = q.toLowerCase();
  const results = rows
    .filter((u) => u.status === "active")
    .filter((u) => (u.name ?? "").toLowerCase().includes(needle) || u.email.toLowerCase().includes(needle))
    .slice(0, 10)
    .map(({ id, name, email }) => ({ id, name, email }));

  return NextResponse.json({ results });
}
