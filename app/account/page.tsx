import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CalendarDays, LogOut, MapPin, ShieldCheck } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { DestinationCard, ArticleCard } from "@/components/cards";
import { PageHeader } from "@/components/page-header";
import { DeleteAccountForm, ExportDataButton, PasswordForm, ProfileForm } from "@/components/account/profile-forms";
import { EmptyState } from "@/components/ui/primitives";
import { getCurrentUser } from "@/lib/auth";
import { getDbOrNull } from "@/lib/db";
import { getSavedArticles, getSavedDestinations, getTripsForUser } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My account",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const user = await getCurrentUser().catch(() => null);
  if (!user) redirect("/login?next=/account");

  const db = await getDbOrNull();
  const [savedPlaces, savedReading, trips] = db
    ? await Promise.all([
        getSavedDestinations(db, user.id).catch(() => []),
        getSavedArticles(db, user.id).catch(() => []),
        getTripsForUser(db, user.id).catch(() => []),
      ])
    : [[], [], []];

  return (
    <main id="main">
      <PageHeader
        eyebrow="Your account"
        title={`Hello, ${user.name.split(" ")[0]}`}
        description={`Signed in as ${user.email}. Joined ${formatDate(user.createdAt)}.`}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Account" }]}
      >
        <div className="flex flex-wrap gap-2">
          <Link href="/account/trips" className="btn btn-primary px-4 py-2 text-[12.5px]">
            <CalendarDays className="size-3.5" aria-hidden /> Saved trips ({trips.length})
          </Link>
          <Link href="/trip-planner" className="btn btn-ghost px-4 py-2 text-[12.5px]">
            New itinerary
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="btn btn-ghost px-4 py-2 text-[12.5px]">
              <LogOut className="size-3.5" aria-hidden /> Sign out
            </button>
          </form>
        </div>
      </PageHeader>

      <div className="page grid gap-6 py-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-5">
          <section className="card p-5" aria-labelledby="profile-title">
            <h2 id="profile-title" className="text-[15px] font-bold text-forest-900">
              Profile
            </h2>
            <p className="mt-1 text-[11.5px] text-ink-400">Role: {user.role}. Nothing here is shared publicly.</p>
            <div className="mt-4">
              <ProfileForm name={user.name} locale={user.locale} />
            </div>
          </section>

          <section className="card p-5" aria-labelledby="privacy-title">
            <h2 id="privacy-title" className="flex items-center gap-1.5 text-[15px] font-bold text-forest-900">
              <ShieldCheck className="size-4 text-forest-600" aria-hidden /> Privacy and data
            </h2>
            <p className="mt-1 text-[11.5px] leading-relaxed text-ink-500">
              Your itineraries, saved places and reading list are stored against your account only. Nobody else can see
              them unless you explicitly share a trip link.
            </p>
            <div className="mt-3">
              <ExportDataButton />
            </div>
            <div className="mt-4 border-t border-ink-900/8 pt-4">
              <PasswordForm />
            </div>
            <div className="mt-4">
              <DeleteAccountForm />
            </div>
            <p className="mt-3 text-[10.5px] leading-relaxed text-ink-400">
              Read the{" "}
              <Link href="/privacy" className="underline">
                privacy policy
              </Link>{" "}
              for retention details.
            </p>
          </section>
        </div>

        <div className="space-y-8">
          <section aria-labelledby="saved-places">
            <div className="flex items-end justify-between gap-3">
              <h2 id="saved-places" className="display text-[1.5rem] text-forest-900">
                Saved places
              </h2>
              <Link href="/destinations" className="text-[11.5px] font-semibold text-river-700 underline">
                Find more
              </Link>
            </div>
            {savedPlaces.length ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {savedPlaces.map((destination) => (
                  <DestinationCard key={destination.slug} destination={destination} sizes="(max-width:768px) 90vw, 25vw" />
                ))}
              </div>
            ) : (
              <div className="mt-3">
                <EmptyState
                  title="Nothing saved yet"
                  description="Tap Save on any destination page and it will appear here."
                  action={
                    <Link href="/destinations" className="btn btn-primary px-4 py-2 text-[12.5px]">
                      Browse destinations
                    </Link>
                  }
                />
              </div>
            )}
          </section>

          <section aria-labelledby="saved-reading">
            <div className="flex items-end justify-between gap-3">
              <h2 id="saved-reading" className="display text-[1.5rem] text-forest-900">
                Reading list
              </h2>
              <Link href="/travel-guides" className="text-[11.5px] font-semibold text-river-700 underline">
                Guides
              </Link>
            </div>
            {savedReading.length ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {savedReading.map(({ article }) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <p className="mt-3 rounded-xl border border-dashed border-ink-900/15 px-4 py-5 text-[12px] text-ink-500">
                No saved guides yet. Use “Save guide” on any guide or blog post.
              </p>
            )}
          </section>

          <section aria-labelledby="trip-teaser">
            <div className="flex items-end justify-between gap-3">
              <h2 id="trip-teaser" className="display text-[1.5rem] text-forest-900">
                Your itineraries
              </h2>
              <Link href="/account/trips" className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-river-700 underline">
                Manage <ArrowRight className="size-3" aria-hidden />
              </Link>
            </div>
            {trips.length ? (
              <ul className="mt-3 space-y-2">
                {trips.slice(0, 3).map((trip) => (
                  <li key={trip.id}>
                    <Link
                      href={`/trip-planner?trip=${trip.id}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-ink-900/8 bg-white px-4 py-3 hover:border-forest-400"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-semibold text-forest-900">{trip.name}</span>
                        <span className="mt-0.5 flex items-center gap-2 text-[10.5px] text-ink-400">
                          <MapPin className="size-2.5" aria-hidden /> {trip.destination ?? "Unnamed destination"}
                          <span>· {trip.days.length} days</span>
                          <span>· updated {formatDate(trip.updatedAt)}</span>
                        </span>
                      </span>
                      <ArrowRight className="size-3.5 shrink-0 text-ink-400" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 rounded-xl border border-dashed border-ink-900/15 px-4 py-5 text-[12px] text-ink-500">
                No saved itineraries yet.{" "}
                <Link href="/trip-planner" className="font-semibold text-river-700 underline">
                  Build one
                </Link>
                .
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
