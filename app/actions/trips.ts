"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { and, eq, inArray } from "drizzle-orm";
import { tripActivities, tripDays, trips } from "@/db/schema";
import { getDbOrNull } from "@/lib/db";
import { getCurrentUser, randomToken } from "@/lib/auth";
import { planSchema } from "@/lib/planner";

const metaSchema = z.object({
  tripId: z.string().max(80).optional(),
  name: z.string().trim().min(2, "Give the trip a name.").max(120),
  origin: z.string().trim().max(80).optional().default(""),
  destination: z.string().trim().max(120).optional().default(""),
  startDate: z.string().max(20).optional().default(""),
  endDate: z.string().max(20).optional().default(""),
  travelers: z.coerce.number().int().min(1).max(20).default(2),
  budgetBdt: z.coerce.number().int().min(0).max(5_000_000).optional(),
  style: z.enum(["budget", "standard", "premium"]).default("standard"),
  notes: z.string().max(2000).optional().default(""),
});

const saveSchema = z.object({
  meta: metaSchema,
  plan: planSchema.passthrough(),
});

export type TripActionResult = {
  ok: boolean;
  message: string;
  tripId?: string;
  shareToken?: string | null;
  requiresAuth?: boolean;
};

export async function saveTripAction(input: unknown): Promise<TripActionResult> {
  const parsed = saveSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "That itinerary could not be saved." };
  }

  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Sign in to save this itinerary.", requiresAuth: true };

  const db = await getDbOrNull();
  if (!db) return { ok: false, message: "Saving is unavailable: the database is not connected." };

  const { meta, plan } = parsed.data;
  const now = new Date().toISOString();
  let tripId = meta.tripId;
  let shareToken: string | null = null;

  try {
    if (tripId) {
      const existing = await db
        .select()
        .from(trips)
        .where(and(eq(trips.id, tripId), eq(trips.userId, user.id)))
        .limit(1);
      if (!existing[0]) return { ok: false, message: "That trip is not in your account." };
      shareToken = existing[0].shareToken;

      await db
        .update(trips)
        .set({
          name: meta.name,
          origin: meta.origin || null,
          destination: meta.destination || plan.destinationName,
          startDate: meta.startDate || null,
          endDate: meta.endDate || null,
          travelers: meta.travelers,
          budgetBdt: meta.budgetBdt ?? plan.budget.total,
          style: meta.style,
          notes: meta.notes || null,
          updatedAt: now,
        })
        .where(eq(trips.id, tripId));

      const existingDays = await db.select({ id: tripDays.id }).from(tripDays).where(eq(tripDays.tripId, tripId));
      if (existingDays.length) {
        await db.delete(tripActivities).where(inArray(tripActivities.dayId, existingDays.map((day) => day.id)));
        await db.delete(tripDays).where(eq(tripDays.tripId, tripId));
      }
    } else {
      tripId = crypto.randomUUID();
      await db.insert(trips).values({
        id: tripId,
        userId: user.id,
        name: meta.name,
        origin: meta.origin || null,
        destination: meta.destination || plan.destinationName,
        startDate: meta.startDate || null,
        endDate: meta.endDate || null,
        travelers: meta.travelers,
        budgetBdt: meta.budgetBdt ?? plan.budget.total,
        style: meta.style,
        notes: meta.notes || null,
        isPublic: 0,
        createdAt: now,
        updatedAt: now,
      });
    }

    for (const day of plan.days) {
      const dayId = crypto.randomUUID();
      await db.insert(tripDays).values({
        id: dayId,
        tripId: tripId!,
        dayIndex: day.day,
        date: day.date || null,
        title: day.title,
        notes: day.notes || null,
      });
      if (day.activities.length) {
        await db.insert(tripActivities).values(
          day.activities.map((activity, index) => ({
            id: crypto.randomUUID(),
            dayId,
            sort: index,
            timeLabel: activity.time,
            title: activity.title.slice(0, 160),
            kind: activity.kind,
            durationMin: activity.durationMin,
            costBdt: activity.costBdt,
            notes: activity.notes?.slice(0, 400) || null,
          })),
        );
      }
    }

    revalidatePath("/account");
    revalidatePath("/account/trips");
    return { ok: true, message: "Itinerary saved to your account.", tripId: tripId!, shareToken };
  } catch {
    return { ok: false, message: "We could not save the itinerary. Please try again." };
  }
}

export async function deleteTripAction(tripId: string): Promise<TripActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Sign in first.", requiresAuth: true };
  const db = await getDbOrNull();
  if (!db) return { ok: false, message: "Saving is unavailable." };

  const existing = await db
    .select({ id: trips.id })
    .from(trips)
    .where(and(eq(trips.id, tripId), eq(trips.userId, user.id)))
    .limit(1);
  if (!existing[0]) return { ok: false, message: "Trip not found." };

  try {
    const days = await db.select({ id: tripDays.id }).from(tripDays).where(eq(tripDays.tripId, tripId));
    if (days.length) {
      await db.delete(tripActivities).where(inArray(tripActivities.dayId, days.map((day) => day.id)));
    }
    await db.delete(tripDays).where(eq(tripDays.tripId, tripId));
    await db.delete(trips).where(eq(trips.id, tripId));
    revalidatePath("/account");
    revalidatePath("/account/trips");
    return { ok: true, message: "Trip deleted." };
  } catch {
    return { ok: false, message: "We could not delete that trip." };
  }
}

export async function duplicateTripAction(tripId: string): Promise<TripActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Sign in first.", requiresAuth: true };
  const db = await getDbOrNull();
  if (!db) return { ok: false, message: "Saving is unavailable." };

  try {
    const rows = await db
      .select()
      .from(trips)
      .where(and(eq(trips.id, tripId), eq(trips.userId, user.id)))
      .limit(1);
    const source = rows[0];
    if (!source) return { ok: false, message: "Trip not found." };

    const newId = crypto.randomUUID();
    const now = new Date().toISOString();
    await db.insert(trips).values({
      ...source,
      id: newId,
      name: `${source.name} (copy)`.slice(0, 120),
      shareToken: null,
      isPublic: 0,
      createdAt: now,
      updatedAt: now,
    });

    const days = await db.select().from(tripDays).where(eq(tripDays.tripId, source.id));
    for (const day of days) {
      const newDayId = crypto.randomUUID();
      await db.insert(tripDays).values({ ...day, id: newDayId, tripId: newId });
      const activities = await db.select().from(tripActivities).where(eq(tripActivities.dayId, day.id));
      if (activities.length) {
        await db.insert(tripActivities).values(
          activities.map((activity) => ({ ...activity, id: crypto.randomUUID(), dayId: newDayId })),
        );
      }
    }

    revalidatePath("/account/trips");
    return { ok: true, message: "Trip duplicated.", tripId: newId };
  } catch {
    return { ok: false, message: "We could not duplicate that trip." };
  }
}

export async function setTripSharingAction(tripId: string, isPublic: boolean): Promise<TripActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Sign in first.", requiresAuth: true };
  const db = await getDbOrNull();
  if (!db) return { ok: false, message: "Saving is unavailable." };

  try {
    const rows = await db
      .select()
      .from(trips)
      .where(and(eq(trips.id, tripId), eq(trips.userId, user.id)))
      .limit(1);
    const trip = rows[0];
    if (!trip) return { ok: false, message: "Trip not found." };

    const token = trip.shareToken ?? randomToken(18);
    await db
      .update(trips)
      .set({ isPublic: isPublic ? 1 : 0, shareToken: token, updatedAt: new Date().toISOString() })
      .where(eq(trips.id, tripId));

    revalidatePath("/account/trips");
    return {
      ok: true,
      message: isPublic ? "Anyone with the link can view this itinerary." : "Sharing is off. The link no longer works.",
      shareToken: token,
    };
  } catch {
    return { ok: false, message: "We could not update sharing for this trip." };
  }
}
