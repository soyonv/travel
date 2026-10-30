import { NextResponse } from "next/server";
import { searchAll } from "@/lib/queries";
import { expandQuery } from "@/lib/search";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw = (url.searchParams.get("q") ?? "").slice(0, 80);
  if (raw.trim().length < 2) {
    return NextResponse.json({ results: [], query: raw }, { headers: { "cache-control": "no-store" } });
  }

  let results = await searchAll(raw);
  if (!results.length) {
    for (const alternative of expandQuery(raw)) {
      results = await searchAll(alternative);
      if (results.length) break;
    }
  }

  return NextResponse.json(
    { results, query: raw, count: results.length },
    { headers: { "cache-control": "public, max-age=30, stale-while-revalidate=120" } },
  );
}
