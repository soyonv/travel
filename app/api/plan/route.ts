import { NextResponse } from "next/server";
import { getBindings, getDbOrNull } from "@/lib/db";
import { planInputSchema, planSchema, buildDataPlan, resolveDays, pickDestination, buildGrounding } from "@/lib/planner";
import { callAiJson, isAiConfigured, AiNotConfiguredError } from "@/lib/ai";
import { checkRateLimit, clientKey, isSameOrigin } from "@/lib/rate-limit";
import { calculateBudget } from "@/lib/budget";
import { getAlerts } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 });
  }

  const limited = await checkRateLimit(await clientKey(request, "plan"), 20, 60 * 60);
  if (!limited.allowed) {
    return NextResponse.json(
      { error: "Too many plan requests. Please try again shortly." },
      { status: 429, headers: { "retry-after": String(limited.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = planInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Some details need fixing.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }
  const input = parsed.data;

  const db = await getDbOrNull();
  if (!db) {
    return NextResponse.json(
      { error: "The destination database is not connected. Apply the migration and seed data first." },
      { status: 503 },
    );
  }

  const dataPlan = await buildDataPlan(db, input);
  if (!dataPlan) {
    return NextResponse.json({ error: "We could not find a destination to plan around." }, { status: 404 });
  }

  const bindings = await getBindings();
  if (!isAiConfigured(bindings)) {
    return NextResponse.json({ plan: dataPlan, source: "data-model", aiConfigured: false });
  }

  try {
    const destination = await pickDestination(db, input);
    const grounding = await buildGrounding(db);
    const alerts = await getAlerts(db);
    const days = resolveDays(input);
    const budget = calculateBudget({
      days,
      travelers: input.travelers,
      style: input.style,
      transport: input.transport,
      accommodation: input.accommodation,
      includeGuide: input.includeGuide,
      includeBoat: input.includeBoat,
    });

    const result = await callAiJson({
      bindings,
      maxTokens: 2600,
      messages: [
        {
          role: "system",
          content: `You are BanglaVoyage AI, a Bangladesh trip planner. Return a single JSON object matching this TypeScript type exactly:
{
  title: string, summary: string, destinationSlug: string, destinationName: string,
  days: { day: number, date: string, title: string, base: string, notes: string,
          activities: { time: string, title: string, kind: "travel"|"activity"|"meal"|"rest"|"checkin"|"note", durationMin: number, costBdt: number, notes: string }[] }[],
  budget: { transport: number, accommodation: number, food: number, localTransport: number, activities: number, contingency: number, total: number, perPerson: number },
  tips: string[], sources: { label: string, url: string }[], estimateNotice: string
}
Rules: use only the grounding data for places; never invent booking confirmations, operators, hotels or exact fares; costs are integer BDT estimates; keep the plan realistic for travel time in Bangladesh; number of days must equal ${days}. Write in ${
            input.lang === "bn" ? "Bangla" : "English"
          }. Return JSON only, no prose.`,
        },
        {
          role: "user",
          content: JSON.stringify({
            request: input,
            days,
            destination: destination
              ? {
                  name: destination.destination.nameEn,
                  slug: destination.destination.slug,
                  district: destination.districtName,
                  summary: destination.destination.summaryEn,
                  bestTime: destination.destination.bestTime,
                  seasonalNote: destination.destination.seasonalNote,
                  highlights: destination.destination.highlights,
                  sources: destination.destination.sources,
                }
              : null,
            budgetModel: budget,
            grounding,
            alerts: alerts.map((alert) => ({ title: alert.title, body: alert.body, severity: alert.severity })),
          }).slice(0, 14000),
        },
      ],
    });

    const validated = planSchema.safeParse(result);
    if (!validated.success) {
      return NextResponse.json({
        plan: dataPlan,
        source: "data-model",
        aiConfigured: true,
        notice: "The AI response did not pass validation, so we returned a data-based plan instead.",
      });
    }

    return NextResponse.json({ plan: { ...validated.data, source: "ai" }, source: "ai", aiConfigured: true });
  } catch (error) {
    const message =
      error instanceof AiNotConfiguredError
        ? "AI is not configured."
        : "The AI planner is temporarily unavailable. A data-based plan is shown instead.";
    return NextResponse.json({ plan: dataPlan, source: "data-model", aiConfigured: true, notice: message });
  }
}
