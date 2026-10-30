import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, Lock, MapPin, Users, Wallet } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { PrintButton } from "@/components/trips/print-button";
import { getDbOrNull } from "@/lib/db";
import { getSharedTrip } from "@/lib/queries";
import { formatBDT, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shared itinerary",
  description: "A read-only Bangladesh itinerary shared from Discover Bangladesh AI.",
  robots: { index: false, follow: false },
};

export default async function SharedTripPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const db = await getDbOrNull();
  if (!db) notFound();

  const trip = await getSharedTrip(db, token);
  if (!trip) notFound();

  const total = trip.days.reduce(
    (sum, day) => sum + day.activities.reduce((daySum, activity) => daySum + (activity.costBdt ?? 0), 0),
    0,
  );

  return (
    <main id="main" className="page py-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Logo compact />
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-ivory-100 px-2.5 py-1 text-[10.5px] font-semibold text-ink-500">
              <Lock className="size-2.5" aria-hidden /> Shared read-only link
            </span>
            <PrintButton />
          </div>
        </div>

        <header className="mt-6 border-b border-ink-900/8 pb-6">
          <p className="eyebrow mb-2">Itinerary</p>
          <h1 className="display text-[clamp(2rem,4.4vw,3rem)] text-forest-900">{trip.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-ink-500">
            {trip.destination ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" aria-hidden /> {trip.destination}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1">
              <Users className="size-3.5" aria-hidden /> {trip.travelers} traveller{trip.travelers === 1 ? "" : "s"}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3.5" aria-hidden /> {trip.days.length} days
              {trip.startDate ? ` from ${formatDate(trip.startDate)}` : ""}
            </span>
            {trip.budgetBdt ? (
              <span className="inline-flex items-center gap-1">
                <Wallet className="size-3.5" aria-hidden /> {formatBDT(trip.budgetBdt)} estimated
              </span>
            ) : null}
          </div>
          {trip.notes ? <p className="mt-3 text-[13px] leading-relaxed text-ink-600">{trip.notes}</p> : null}
        </header>

        <div className="mt-6 space-y-4">
          {trip.days.map((day) => (
            <section key={day.id} className="card p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-[15px] font-bold text-forest-900">
                  Day {day.dayIndex}
                  {day.title ? <span className="ml-2 font-normal text-ink-600">· {day.title}</span> : null}
                </h2>
                {day.date ? <p className="text-[11px] text-ink-400">{formatDate(day.date)}</p> : null}
              </div>
              <ul className="mt-3 space-y-2">
                {day.activities.map((activity) => (
                  <li key={activity.id} className="flex gap-3 border-b border-ink-900/5 pb-2 last:border-0 last:pb-0">
                    <span className="w-10 shrink-0 text-[11px] font-semibold text-forest-600">{activity.timeLabel}</span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-ink-800">{activity.title}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[10.5px] text-ink-400">
                        <span className="inline-flex items-center gap-0.5">
                          <Clock className="size-2.5" aria-hidden /> {activity.durationMin ?? 0} min
                        </span>
                        <span>{activity.kind}</span>
                        <span>{activity.costBdt ? `≈ ${formatBDT(activity.costBdt)}` : "free"}</span>
                      </p>
                      {activity.notes ? <p className="mt-0.5 text-[11px] leading-relaxed text-ink-500">{activity.notes}</p> : null}
                    </div>
                  </li>
                ))}
                {day.activities.length === 0 ? <li className="text-[12px] text-ink-400">No stops recorded.</li> : null}
              </ul>
              {day.notes ? <p className="mt-2 text-[11px] text-ink-400">{day.notes}</p> : null}
            </section>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-sunset-100 bg-sunset-100/40 px-3.5 py-3 text-[11.5px] leading-relaxed text-ink-700">
          Estimated activity costs total {formatBDT(total)}. This shared page shows one person&apos;s draft plan — nothing is
          booked, and the owner can turn sharing off at any time.
        </div>

        <footer className="mt-8 border-t border-ink-900/8 pt-5 text-center">
          <p className="text-[11.5px] text-ink-500">
            Made with{" "}
            <Link href="/" className="font-semibold text-forest-800 underline">
              Discover Bangladesh AI
            </Link>
            .{" "}
            <Link href="/trip-planner" className="text-river-700 underline">
              Build your own itinerary
            </Link>
            .
          </p>
        </footer>
      </div>
    </main>
  );
}
