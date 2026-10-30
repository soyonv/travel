import { getCurrentUser } from "@/lib/auth";
import { getDbOrNull } from "@/lib/db";
import { getSavedArticles, getSavedDestinations, getTripsForUser } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser().catch(() => null);
  if (!user) {
    return Response.json({ error: "Sign in to export your data." }, { status: 401, headers: { "cache-control": "no-store" } });
  }

  const db = await getDbOrNull();
  if (!db) {
    return Response.json({ error: "The database is not connected." }, { status: 503, headers: { "cache-control": "no-store" } });
  }

  try {
    const [places, reading, trips] = await Promise.all([
      getSavedDestinations(db, user.id),
      getSavedArticles(db, user.id),
      getTripsForUser(db, user.id),
    ]);

    const payload = {
      exportedAt: new Date().toISOString(),
      notice:
        "This file contains your account profile, saved places, reading list and itineraries. It excludes password hashes and session tokens, which stay server-side.",
      account: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        locale: user.locale,
        createdAt: user.createdAt,
      },
      savedDestinations: places.map((place) => ({
        slug: place.slug,
        name: place.nameEn,
        nameBn: place.nameBn,
        category: place.category,
        region: place.region,
      })),
      savedArticles: reading.map(({ article }) => ({
        slug: article.slug,
        title: article.title,
        type: article.type,
        url: article.type === "guide" ? `/travel-guides/${article.slug}` : `/blog/${article.slug}`,
      })),
      trips: trips.map((trip) => ({
        id: trip.id,
        name: trip.name,
        origin: trip.origin,
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        travelers: trip.travelers,
        budgetBdt: trip.budgetBdt,
        style: trip.style,
        notes: trip.notes,
        shared: trip.isPublic === 1,
        shareUrl: trip.isPublic === 1 && trip.shareToken ? `/trips/${trip.shareToken}` : null,
        createdAt: trip.createdAt,
        updatedAt: trip.updatedAt,
        days: trip.days.map((day) => ({
          day: day.dayIndex,
          date: day.date,
          title: day.title,
          notes: day.notes,
          activities: day.activities.map((activity) => ({
            time: activity.timeLabel,
            title: activity.title,
            kind: activity.kind,
            durationMin: activity.durationMin,
            costBdt: activity.costBdt,
            notes: activity.notes,
          })),
        })),
      })),
    };

    return new Response(JSON.stringify(payload, null, 2), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "content-disposition": `attachment; filename="discover-bangladesh-data-${new Date().toISOString().slice(0, 10)}.json"`,
        "cache-control": "no-store",
      },
    });
  } catch {
    return Response.json(
      { error: "The export could not be prepared. Please try again." },
      { status: 500, headers: { "cache-control": "no-store" } },
    );
  }
}
