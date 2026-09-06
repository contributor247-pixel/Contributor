import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { reports } from "../../../../drizzle/schema/index";
import { requireAuth, UnauthenticatedError } from "@/lib/permissions";
import { reportSchema } from "@/lib/validators/report";

export async function POST(request: Request) {
  let session;
  try {
    session = await requireAuth();
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ error: "You must be logged in to report an article." }, { status: 401 });
    }
    throw err;
  }

  const body = await request.json().catch(() => null);
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid report" }, { status: 400 });
  }

  const [existingOpenReport] = await db
    .select({ id: reports.id })
    .from(reports)
    .where(
      and(
        eq(reports.articleId, parsed.data.articleId),
        eq(reports.reportedByUserId, session.user.id),
        eq(reports.status, "open")
      )
    )
    .limit(1);

  if (existingOpenReport) {
    return NextResponse.json(
      { error: "You already have an open report for this article." },
      { status: 409 }
    );
  }

  await db.insert(reports).values({
    articleId: parsed.data.articleId,
    reportedByUserId: session.user.id,
    reason: parsed.data.reason,
    detail: parsed.data.detail ?? null,
  });

  return NextResponse.json({ success: true });
}
