import { z } from "zod";
import { and, eq, inArray } from "drizzle-orm";
import { attractions, destinations, districts } from "@/db/schema";
import type { Db } from "@/lib/db";
import { calculateBudget, clampInt, type BudgetBreakdown, type TravelStyle } from "@/lib/budget";
import { daysBetween, formatBDT } from "@/lib/utils";

export const planInputSchema = z.object({
  origin: z.string().trim().max(80).optional().default("Dhaka"),
  destinationSlug: z.string().trim().max(80).optional(),
  region: z.string().trim().max(80).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date").optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date").optional(),
  days: z.coerce.number().int().min(1).max(21).optional(),
  travelers: z.coerce.number().int().min(1).max(20).default(2),
  budgetBdt: z.coerce.number().int().min(0).max(2_000_000).optional(),
  style: z.enum(["budget", "standard", "premium"]).default("standard"),
  accommodation: z.enum(["hostel", "guesthouse", "hotel", "resort", "luxury"]).default("hotel"),
  transport: z.enum(["bus", "train", "flight", "private_car", "mixed"]).default("bus"),
  interests: z.array(z.string().max(40)).max(8).optional().default([]),
  dietary: z.string().trim().max(240).optional().default(""),
  includeGuide: z.boolean().optional().default(false),
  includeBoat: z.boolean().optional().default(false),
  lang: z.enum(["en", "bn"]).optional().default("en"),
});

export type PlanInput = z.infer<typeof planInputSchema>;

export const planActivitySchema = z.object({
  time: z.string().max(24),
  title: z.string().min(3).max(140),
  kind: z.enum(["travel", "activity", "meal", "rest", "checkin", "note"]).default("activity"),
  durationMin: z.number().int().min(0).max(720).default(90),
  costBdt: z.number().int().min(0).max(200_000).default(0),
  notes: z.string().max(400).optional().default(""),
});

export const planDaySchema = z.object({
  day: z.number().int().min(1).max(30),
  date: z.string().max(24).optional().default(""),
  title: z.string().min(3).max(120),
  base: z.string().max(120).optional().default(""),
  activities: z.array(planActivitySchema).min(1).max(10),
  notes: z.string().max(400).optional().default(""),
});

export const planSchema = z.object({
  title: z.string().min(3).max(140),
  summary: z.string().min(10).max(900),
  destinationSlug: z.string().max(80),
  destinationName: z.string().max(120),
  days: z.array(planDaySchema).min(1).max(21),
  budget: z.object({
    transport: z.number().int().min(0),
    accommodation: z.number().int().min(0),
    food: z.number().int().min(0),
    localTransport: z.number().int().min(0),
    activities: z.number().int().min(0),
    contingency: z.number().int().min(0),
    total: z.number().int().min(0),
    perPerson: z.number().int().min(0),
  }),
  tips: z.array(z.string().max(400)).max(10).default([]),
  sources: z.array(z.object({ label: z.string().max(120), url: z.string().max(400) })).max(8).default([]),
  estimateNotice: z.string().max(400),
});

export type Plan = z.infer<typeof planSchema> & { source?: "ai" | "data-model" };

/** Resolves the requested trip length from explicit days or a date range. */
export function resolveDays(input: PlanInput): number {
  if (input.startDate && input.endDate) {
    const start = Date.parse(input.startDate);
    const end = Date.parse(input.endDate);
    // Reversed or invalid ranges fall back to the explicit day count.
    if (Number.isFinite(start) && Number.isFinite(end) && end >= start) {
      return clampInt(daysBetween(input.startDate, input.endDate), 1, 21);
    }
  }
  return clampInt(input.days ?? 3, 1, 21);
}

export async function pickDestination(db: Db, input: PlanInput) {
  if (input.destinationSlug) {
    const rows = await db
      .select({ destination: destinations, districtName: districts.nameEn })
      .from(destinations)
      .leftJoin(districts, eq(destinations.districtId, districts.id))
      .where(eq(destinations.slug, input.destinationSlug))
      .limit(1);
    if (rows[0]) return rows[0];
  }

  if (input.interests?.length) {
    const matched = await db
      .select({ destination: destinations, districtName: districts.nameEn })
      .from(destinations)
      .where(inArray(destinations.category, input.interests))
      .limit(1);
    if (matched[0]) return matched[0];
  }

  if (input.region) {
    const regional = await db
      .select({ destination: destinations, districtName: districts.nameEn })
      .from(destinations)
      .where(eq(destinations.region, input.region))
      .limit(1);
    if (regional[0]) return regional[0];
  }

  const fallback = await db
    .select({ destination: destinations, districtName: districts.nameEn })
    .from(destinations)
    .where(eq(destinations.featured, 1))
    .limit(1);
  return fallback[0] ?? null;
}

type ActivitySeed = {
  time: string;
  title: string;
  kind: "travel" | "activity" | "meal" | "rest" | "checkin" | "note";
  durationMin: number;
  costBdt: number;
  notes: string;
};

/**
 * Deterministic, data-grounded plan used when no AI key is configured and as the
 * fallback when AI output fails validation.
 */
export async function buildDataPlan(db: Db, input: PlanInput): Promise<Plan | null> {
  const chosen = await pickDestination(db, input);
  if (!chosen) return null;

  const destination = chosen.destination;
  const days = resolveDays(input);
  const travelers = clampInt(input.travelers, 1, 20);
  const breakdown: BudgetBreakdown = calculateBudget({
    days,
    travelers,
    style: input.style as TravelStyle,
    transport: input.transport,
    accommodation: input.accommodation,
    includeGuide: input.includeGuide,
    includeBoat: input.includeBoat,
    activitiesPerDay: 2,
  });

  const nearby = await db
    .select()
    .from(attractions)
    .where(and(eq(attractions.districtId, destination.districtId ?? "")))
    .limit(12);

  const linked = await db
    .select()
    .from(attractions)
    .where(eq(attractions.destinationId, destination.id))
    .limit(12);

  const pool = [...linked, ...nearby].filter(
    (item, index, list) => list.findIndex((entry) => entry.slug === item.slug) === index,
  );
  const sightPool = pool.length ? pool : [];

  const perActivityCost = Math.round(breakdown.groupTotal / travelers / days / 2);
  const activityCost = Math.min(perActivityCost, 2500);

  const planDays: z.infer<typeof planDaySchema>[] = [];
  let sightIndex = 0;
  const nextSight = () => sightPool[sightIndex++ % Math.max(1, sightPool.length)];

  for (let dayIndex = 1; dayIndex <= days; dayIndex += 1) {
    const date =
      input.startDate && !Number.isNaN(new Date(input.startDate).getTime())
        ? new Date(new Date(input.startDate).getTime() + (dayIndex - 1) * 86_400_000).toISOString().slice(0, 10)
        : "";
    const activities: ActivitySeed[] = [];

    if (dayIndex === 1) {
      activities.push({
        time: "08:00",
        title: `Travel from ${input.origin || "Dhaka"} to ${destination.nameEn}`,
        kind: "travel",
        durationMin: input.transport === "flight" ? 170 : 330,
        costBdt: 0,
        notes: "Estimated journey time. Confirm the schedule with the operator and keep a buffer for delays.",
      });
      activities.push({
        time: "13:00",
        title: "Check in and settle in",
        kind: "checkin",
        durationMin: 60,
        costBdt: 0,
        notes: "Ask for a room away from the road, and confirm check-out time.",
      });
      activities.push({
        time: "14:30",
        title: "Local lunch near the hotel",
        kind: "meal",
        durationMin: 75,
        costBdt: Math.round(breakdown.groupTotal / travelers / days / 4),
        notes: "Estimated food cost for the group, based on the selected style.",
      });
      activities.push({
        time: "16:30",
        title: `Orientation walk around ${destination.nameEn}`,
        kind: "activity",
        durationMin: 120,
        costBdt: 0,
        notes: "Free, low-effort walk to get your bearings before the full days.",
      });
    } else if (dayIndex === days) {
      activities.push({
        time: "07:30",
        title: "Breakfast and pack",
        kind: "meal",
        durationMin: 60,
        costBdt: Math.round(breakdown.groupTotal / travelers / days / 5),
        notes: "Keep bags packed before breakfast if you have a long return journey.",
      });
      const last = nextSight();
      activities.push({
        time: "09:00",
        title: last ? last.nameEn : "Local market and souvenir walk",
        kind: "activity",
        durationMin: 120,
        costBdt: activityCost,
        notes: last?.description?.slice(0, 220) ?? "Buy directly from makers where possible and agree prices first.",
      });
      activities.push({
        time: "12:00",
        title: "Check out and depart",
        kind: "travel",
        durationMin: 300,
        costBdt: 0,
        notes: "Leave a buffer of at least three hours before any onward flight.",
      });
    } else {
      for (const slot of ["09:00", "14:00"] as const) {
        const sight = nextSight();
        if (!sight) break;
        activities.push({
          time: slot,
          title: sight.nameEn,
          kind: "activity",
          durationMin: slot === "09:00" ? 150 : 120,
          costBdt: activityCost,
          notes: `${sight.description.slice(0, 180)} Ticket and guide fees vary — confirm locally.`,
        });
        if (slot === "09:00") {
          activities.push({
            time: "13:00",
            title: "Lunch break",
            kind: "meal",
            durationMin: 60,
            costBdt: Math.round(breakdown.groupTotal / travelers / days / 5),
            notes: "Local restaurant; ask for less chilli if you prefer.",
          });
        }
      }
      if (activities.length < 3) {
        activities.push({
          time: "17:30",
          title: "Sunset viewpoint and tea stall",
          kind: "rest",
          durationMin: 75,
          costBdt: 0,
          notes: "A flexible end to the day that works in most weather.",
        });
      }
    }

    planDays.push({
      day: dayIndex,
      date,
      title:
        dayIndex === 1
          ? `Arrival and first look at ${destination.nameEn}`
          : dayIndex === days
            ? "Last morning and departure"
            : `Exploring ${destination.nameEn}`,
      base: chosen.districtName ?? destination.nameEn,
      activities,
      notes:
        dayIndex === 1
          ? "Keep the first day light and confirm tomorrow's transport the evening before."
          : dayIndex === days
            ? "Allow a buffer before any onward flight or train."
            : "Durations are estimates; drop a stop if the day runs late.",
    });
  }

  const lines = breakdown.lines;
  const find = (key: string) => lines.find((line) => line.key === key)?.amount ?? 0;

  const tips = [
    input.startDate
      ? "Re-check opening hours and transport schedules a week before departure — they change seasonally."
      : "Choose dates before booking: winter (November–February) is the most reliable season almost everywhere.",
    destination.seasonalNote ||
      "Seasonal access can change. Check official advisories before travelling to protected areas.",
    "This plan contains estimates, not reservations. No booking, ticket or payment has been made.",
    input.dietary
      ? `Dietary note recorded: ${input.dietary}. Carry a Bangla translation if the requirement is serious.`
      : "If you have allergies or dietary restrictions, carry a written Bangla translation.",
    travelers > 4
      ? "For groups above four, confirm vehicle capacity and room configuration before paying deposits."
      : "Solo and pair travellers can usually book rooms on arrival in district towns, but not on holiday weekends.",
  ];

  return {
    title: `${destination.nameEn} in ${days} day${days === 1 ? "" : "s"}`,
    summary: `${destination.summaryEn} This is a data-based outline for ${travelers} traveller${travelers === 1 ? "" : "s"} ${
      input.startDate ? `starting ${input.startDate}` : "over your chosen dates"
    }, built from the destination record and our cost model. Every figure is an estimate.`,
    destinationSlug: destination.slug,
    destinationName: destination.nameEn,
    days: planDays,
    budget: {
      transport: find("intercity"),
      accommodation: find("accommodation"),
      food: find("food"),
      localTransport: find("local"),
      activities: find("activities") + find("guide") + find("boat"),
      contingency: find("contingency"),
      total: breakdown.groupTotal,
      perPerson: breakdown.perPerson,
    },
    tips: tips.filter(Boolean).slice(0, 6),
    sources: (destination.sources ?? []).map((source) => ({ label: source.label, url: source.url })),
    estimateNotice: `Estimates for ${travelers} traveller${travelers === 1 ? "" : "s"}, ${days} days, ${input.style} style. Total ${formatBDT(
      breakdown.groupTotal,
    )} (about ${formatBDT(breakdown.perPersonPerDay)} per person per day). Not a quotation.`,
  };
}

/** Compact grounding block for the AI prompt. */
export async function buildGrounding(db: Db) {
  const rows = await db
    .select({
      name: destinations.nameEn,
      nameBn: destinations.nameBn,
      slug: destinations.slug,
      region: destinations.region,
      category: destinations.category,
      summary: destinations.summaryEn,
      bestTime: destinations.bestTime,
      seasonalNote: destinations.seasonalNote,
      highlights: destinations.highlights,
      lat: destinations.lat,
      lon: destinations.lon,
    })
    .from(destinations)
    .limit(20);

  const attractionRows = await db
    .select({
      name: attractions.nameEn,
      district: districts.nameEn,
      description: attractions.description,
      feeNote: attractions.feeNote,
      lat: attractions.lat,
      lon: attractions.lon,
    })
    .from(attractions)
    .leftJoin(districts, eq(attractions.districtId, districts.id))
    .limit(40);

  return { destinations: rows, attractions: attractionRows };
}
