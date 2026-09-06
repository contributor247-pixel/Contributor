import { NextResponse } from "next/server";
import { searchArticles } from "@/lib/queries/articles";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const results = await searchArticles(q, 24);
  return NextResponse.json({ results });
}
