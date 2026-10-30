import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, MapPin, Plus, Users, Wallet } from "lucide-react";
import { TripActions } from "@/components/account/trip-actions";
import { ExportDataButton } from "@/components/account/profile-forms";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/ui/primitives";
import { getCurrentUser } from "@/lib/auth";
import { getDbOrNull } from "@/lib/db";
import { getTripsForUser } from "@/lib/queries";
import { formatBDT, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Saved trips",
  robots: { index: false, follow: false },
};

export default async function AccountTripsPage() {
  const user = await getCurrentUser().catch(() => null);
  if (!user) redirect("/login?next=/account/trips");

  const db = await getDbOrNull();
  const trips = db ? await getTripsForUser(db, user.id).catch(() => []) : [];

  return (
    <main id="main">
      <PageHeader
        eyebrow="Itineraries"
        title="Saved trips"
        description="Edit, duplicate, share or delete your itineraries. Sharing is off until you turn it on, and the link only shows a read-only page."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Account", href: "/account" },
          { label: "Saved trips" },
        ]}
      >
        <div className="flex flex-wrap gap-2">
          <Link href="/trip-planner" className="btn btn-primary px-4 py-2 text-[12.5px]">
            <Plus className="size-3.5" aria-hidden /> New itinerary
          </Link>
          <ExportDataButton />
        </div>
      </PageHeader>

      <div className="page py-8">
        {trips.length ? (
          <ul className="grid gap-4 sm:grid-cols-2">
            {trips.map((trip) => (
              <li key={trip.id} className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-[16px] font-bold text-forest-900">{trip.name}</h2>
                    <p className="mt-0.5 text-[11px] text-ink-400">
                      updated {formatDate(trip.updatedAt)}
                      {trip.startDate ? ` · starts ${formatDate(trip.startDate)}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-forest-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-forest-700">
                    {trip.days.length} days
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-ink-500">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3" aria-hidden /> {trip.destination ?? "Unnamed"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="size-3" aria-hidden /> {trip.travelers}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Wallet className="size-3" aria-hidden /> {trip.budgetBdt ? `${formatBDT(trip.budgetBdt)} est.` : "no budget set"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="size-3" aria-hidden /> {trip.isPublic ? "shared" : "private"}
                  </span>
                </div>

                {trip.days[0]?.activities.length ? (
                  <p className="mt-2 line-clamp-2 text-[11.5px] leading-relaxed text-ink-500">
                    Day 1: {trip.days[0].activities.slice(0, 3).map((activity) => activity.title).join(" · ")}
                  </p>
                ) : null}

                <TripActions tripId={trip.id} isPublic={trip.isPublic === 1} shareToken={trip.shareToken} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No saved trips yet"
            description="Build an itinerary in the planner, then press Save itinerary. It will appear here, ready to edit or share."
            action={
              <Link href="/trip-planner" className="btn btn-primary px-4 py-2 text-[12.5px]">
                Open the planner
              </Link>
            }
          />
        )}

        <aside className="mt-8 flex items-start gap-2 rounded-xl border border-ink-900/8 bg-white px-3.5 py-3 text-[11.5px] leading-relaxed text-ink-500">
          <CalendarDays className="mt-0.5 size-3.5 shrink-0 text-forest-600" aria-hidden />
          Trip budgets are estimates from the model at the moment you saved. Reopen a trip to edit its stops, then save again
          to update it.
        </aside>
      </div>
    </main>
  );
}
