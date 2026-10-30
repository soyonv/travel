import { NextResponse } from "next/server";
import { getBindings, getDb } from "@/lib/db";
import { getSiteStats } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const bindings = await getBindings();
  const configured = {
    database: Boolean(bindings.DB),
    mediaBucket: Boolean(bindings.FILES),
    ai: Boolean(bindings.AI_API_KEY),
  };

  let stats: Awaited<ReturnType<typeof getSiteStats>> | null = null;
  let databaseError: string | null = null;
  try {
    const db = await getDb();
    stats = await getSiteStats(db);
  } catch (error) {
    databaseError = error instanceof Error ? error.message : "Database unavailable";
  }

  return NextResponse.json(
    {
      ok: Boolean(configured.database && !databaseError),
      configured,
      stats,
      databaseError,
      hints: configured.database
        ? configured.ai
          ? []
          : ["Set the AI_API_KEY secret to enable BanglaVoyage AI. The planners fall back to a deterministic, data-grounded plan."]
        : [
            "Add a D1 binding named DB to the Worker.",
            "Run npm run db:migrate:local && npm run db:seed:local for local development.",
          ],
    },
    { headers: { "cache-control": "no-store" } },
  );
}
