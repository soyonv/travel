import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CalendarDays, MoveVertical, Printer, Share2, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { TripBuilder, type SavedTripInput } from "@/components/trips/trip-builder";
import { EmptyState } from "@/components/ui/primitives";
import { getDbOrNull } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getDestinationOptions, getTripForUser } from "@/lib/queries";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI trip planner — build a day-by-day Bangladesh itinerary",
  description:
    "Build a dated Bangladesh itinerary with travel time, meal breaks, accommodation and a cost estimate. Edit it by dragging stops, save it, print it or share a read-only link.",
  alternates: { canonical: "/trip-planner" },
  openGraph: { title: "AI trip planner", url: absoluteUrl("/trip-planner") },
};

export default async function TripPlannerPage({
  searchParams,
}: {
  searchParams: Promise<{ trip?: string; destination?: string }>;
}) {
  const params = await searchParams;
  const db = await getDbOrNull();
  if (!db) {
    return (
      <main id="main">
        <PageHeader eyebrow="Planner" title="Build a trip" breadcrumbs={[{ label: "Home", href: "/" }, { label: "Trip planner" }]} />
        <div className="page py-10">
          <EmptyState title="The database is not connected" description="Apply the migration and seed data, then reload." />
        </div>
      </main>
    );
  }

  const [destinationOptions, user] = await Promise.all([getDestinationOptions(db), getCurrentUser()]);

  let initialTrip: SavedTripInput | null = null;
  if (params.trip && user) {
    const trip = await getTripForUser(db, params.trip, user.id);
    if (trip) {
      initialTrip = {
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
        shareToken: trip.shareToken,
        isPublic: trip.isPublic,
        days: trip.days.map((day) => ({
          dayIndex: day.dayIndex,
          date: day.date,
          title: day.title,
          notes: day.notes,
          activities: day.activities.map((activity) => ({
            timeLabel: activity.timeLabel,
            title: activity.title,
            kind: activity.kind,
            durationMin: activity.durationMin,
            costBdt: activity.costBdt,
            notes: activity.notes,
          })),
        })),
      };
    }
  }

  const initialDestination = params.destination && destinationOptions.some((option) => option.slug === params.destination)
    ? params.destination
    : "";

  return (
    <main id="main">
      <PageHeader
        eyebrow="Smart itinerary builder"
        title="Plan it, then edit it"
        description="The draft is grounded in our destination records and a transparent cost model. Reorder stops by dragging, add your own, then save, print or share a read-only link."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Trip planner" }]}
      >
        <div className="flex flex-wrap gap-2">
          <Link href="/ai-travel-agent" className="btn btn-ghost px-4 py-2 text-[12.5px]">
            <Sparkles className="size-3.5" aria-hidden /> Ask the AI agent instead
          </Link>
          <Link href="/budget-calculator" className="btn btn-ghost px-4 py-2 text-[12.5px]">
            Budget calculator
          </Link>
          {user ? (
            <Link href="/account/trips" className="btn btn-primary px-4 py-2 text-[12.5px]">
              My saved trips
            </Link>
          ) : null}
        </div>
      </PageHeader>

      <div className="page py-8">
        <TripBuilder
          destinations={destinationOptions.map(({ slug, nameEn, category }) => ({ slug, nameEn, category }))}
          initialTrip={initialTrip}
          initialDestination={initialDestination}
          isAuthed={Boolean(user)}
        />

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 print:hidden">
          {[
            { icon: MoveVertical, title: "Drag to reorder", copy: "Move any stop; use the arrows if you prefer the keyboard." },
            { icon: CalendarDays, title: "Real dates", copy: "Travel times are estimated per leg, not invented to fit." },
            { icon: Printer, title: "Print friendly", copy: "A clean paper copy hides the controls and navigation." },
            { icon: Share2, title: "Share carefully", copy: "Links are off by default; turn sharing on per trip." },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-ink-900/8 bg-white px-3.5 py-3">
              <item.icon className="size-4 text-forest-600" aria-hidden />
              <p className="mt-2 text-[12px] font-bold text-forest-900">{item.title}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-ink-500">{item.copy}</p>
            </div>
          ))}
        </div>

        <aside className="mt-6 flex items-start gap-2 rounded-xl border border-sunset-100 bg-sunset-100/40 px-3.5 py-3 text-[11.5px] leading-relaxed text-ink-700 print:hidden">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-sunset-600" aria-hidden />
          <span>
            Every plan is a draft. Opening hours, permits, ferry schedules and road conditions change. Confirm them with the
            provider or official authority before paying for anything. You can also{" "}
            <Link href="/account" className="font-semibold underline">
              export your data
            </Link>{" "}
            from your account.
          </span>
        </aside>
      </div>
    </main>
  );
}

