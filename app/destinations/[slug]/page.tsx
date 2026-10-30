import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  ExternalLink,
  MapPin,
  Mountain,
  Sparkles,
  Wallet,
} from "lucide-react";
import { DestinationCard } from "@/components/cards";
import { SaveButton } from "@/components/account/save-button";
import { Badge, Breadcrumbs, ConfidenceNote, EmptyState, SectionHeading, SourceList } from "@/components/ui/primitives";
import { Markdown } from "@/components/ui/markdown";
import { Reveal } from "@/components/ui/reveal";
import { getDbOrNull } from "@/lib/db";
import {
  getAlerts,
  getAttractionsByDestination,
  getAttractionsByDistrict,
  getDestinationBySlug,
  getRelatedDestinations,
  getSavedDestinationIds,
} from "@/lib/queries";
import { getLang } from "@/lib/lang-server";
import { getCurrentUser } from "@/lib/auth";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const db = await getDbOrNull();
  if (!db) return { title: "Destination" };
  const destination = await getDestinationBySlug(db, slug).catch(() => null);
  if (!destination) return { title: "Destination not found" };

  const title = `${destination.nameEn} travel guide`;
  const description = destination.summaryEn.slice(0, 158);
  return {
    title,
    description,
    alternates: {
      canonical: `/destinations/${destination.slug}`,
      languages: {
        "en-BD": `/destinations/${destination.slug}`,
        "bn-BD": `/destinations/${destination.slug}?lang=bn`,
      },
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: absoluteUrl(`/destinations/${destination.slug}`),
      images: destination.heroImage ? [{ url: destination.heroImage, alt: destination.nameEn }] : undefined,
    },
  };
}

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDbOrNull();
  if (!db) {
    return (
      <main id="main">
        <div className="page py-16">
          <EmptyState
            title="The destination database is not connected"
            description="Apply the migration and seed data, then reload this page."
          />
        </div>
      </main>
    );
  }

  const destination = await getDestinationBySlug(db, slug);
  if (!destination) notFound();

  const lang = await getLang();
  const user = await getCurrentUser().catch(() => null);
  const savedIds = user ? await getSavedDestinationIds(db, user.id).catch(() => new Set<string>()) : new Set<string>();
  const [linked, nearby, related, alerts] = await Promise.all([
    getAttractionsByDestination(db, destination.id),
    destination.districtId ? getAttractionsByDistrict(db, destination.districtId) : Promise.resolve([]),
    getRelatedDestinations(db, destination, 3),
    getAlerts(db).catch(() => []),
  ]);

  const seen = new Set(linked.map((item) => item.id));
  const attractions = [...linked, ...nearby.filter((item) => !seen.has(item.id))].slice(0, 8);
  const relevantAlerts = alerts.filter(
    (alert) => !alert.region || alert.region.toLowerCase().includes((destination.districtName ?? "").toLowerCase()),
  );
  const shownAlerts = relevantAlerts.length ? relevantAlerts : alerts.slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: destination.nameEn,
    alternateName: destination.nameBn,
    description: destination.summaryEn,
    url: absoluteUrl(`/destinations/${destination.slug}`),
    image: destination.heroImage ?? undefined,
    touristType: ["Families", "Solo travellers", "Photographers", "Backpackers"],
    geo:
      typeof destination.lat === "number" && typeof destination.lon === "number"
        ? { "@type": "GeoCoordinates", latitude: destination.lat, longitude: destination.lon }
        : undefined,
    containedInPlace: { "@type": "AdministrativeArea", name: destination.districtName ?? destination.region },
  };

  return (
    <main id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article>
        <div className="page pt-6">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Destinations", href: "/destinations" },
              { label: destination.nameEn },
            ]}
          />
        </div>

        <div className="page grid gap-8 lg:grid-cols-[1.35fr_0.9fr] lg:items-start">
          <div className="relative aspect-[16/10] overflow-hidden rounded-[26px] bg-forest-100">
            {destination.heroImage ? (
              <Image
                src={destination.heroImage}
                alt={`${destination.nameEn}, ${destination.region}`}
                fill
                priority
                sizes="(max-width:1024px) 100vw, 60vw"
                className="object-cover"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-forest-950/70 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-sunset-400">
                {destination.category} · {destination.region}
              </p>
              <h1 className="display mt-2 text-[clamp(2.2rem,5vw,3.8rem)] text-white">{destination.nameEn}</h1>
              <p className="text-[15px] text-ivory-200/85" lang="bn">
                {destination.nameBn}
              </p>
            </div>
          </div>

          <div className="lg:pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="forest">{destination.category}</Badge>
              <Badge tone="outline">
                <MapPin className="size-3" aria-hidden /> {destination.districtName ?? destination.region}
              </Badge>
              {destination.verification === "seed" ? <Badge tone="neutral">Editorial seed data</Badge> : null}
            </div>
            <p className="mt-4 text-[15.5px] leading-relaxed text-ink-700">{destination.summaryEn}</p>

            <dl className="mt-5 space-y-3 border-y border-ink-900/8 py-4 text-[13px]">
              <div className="flex gap-3">
                <dt className="flex w-28 shrink-0 items-center gap-1.5 font-semibold text-forest-900">
                  <CalendarDays className="size-3.5 text-forest-600" aria-hidden /> Best time
                </dt>
                <dd className="text-ink-500">{destination.bestTime ?? "Not recorded — check locally."}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="flex w-28 shrink-0 items-center gap-1.5 font-semibold text-forest-900">
                  <Mountain className="size-3.5 text-forest-600" aria-hidden /> Highlights
                </dt>
                <dd className="text-ink-500">
                  {(destination.highlights ?? []).length ? (destination.highlights ?? []).join(" · ") : "—"}
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link href={`/trip-planner?destination=${destination.slug}`} className="btn btn-primary px-5 text-[13.5px]">
                <Sparkles className="size-4" aria-hidden /> Plan this trip
              </Link>
              <Link href={`/budget-calculator?destination=${destination.slug}`} className="btn btn-ghost px-4 text-[13px]">
                <Wallet className="size-4" aria-hidden /> Estimate costs
              </Link>
              <SaveButton id={destination.id} kind="destination" label="Save" initialSaved={savedIds.has(destination.id)} />
            </div>

            {destination.imageCredit ? (
              <p className="mt-4 text-[10.5px] leading-relaxed text-ink-400">
                Photo:{" "}
                {destination.imageCreditUrl ? (
                  <a
                    href={destination.imageCreditUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-forest-700"
                  >
                    {destination.imageCredit}
                  </a>
                ) : (
                  destination.imageCredit
                )}{" "}
                — see the file page for licence terms.
              </p>
            ) : null}
          </div>
        </div>

        <div className="page mt-10 grid gap-10 lg:grid-cols-[1.35fr_0.9fr]">
          <div>
            <Markdown content={destination.descriptionMd} className="prose-editorial" />

            {shownAlerts.length ? (
              <section className="mt-8" aria-labelledby="advisories">
                <h2 id="advisories" className="text-[17px] font-bold text-forest-900">
                  Before you travel
                </h2>
                <div className="mt-3 space-y-2.5">
                  {shownAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="rounded-xl border border-sunset-100 bg-sunset-100/40 px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-700"
                    >
                      <p className="flex items-center gap-1.5 font-semibold text-forest-900">
                        <AlertTriangle className="size-3.5 text-sunset-600" aria-hidden /> {alert.title}
                      </p>
                      <p className="mt-1">{alert.body}</p>
                      {alert.sourceUrl ? (
                        <a
                          href={alert.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-river-700 underline"
                        >
                          {alert.sourceName ?? "Official source"} <ExternalLink className="size-2.5" aria-hidden />
                        </a>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {destination.seasonalNote ? (
              <div className="mt-6">
                <ConfidenceNote kind="seed" />
                <p className="mt-2 text-[12px] leading-relaxed text-ink-500">Seasonal note: {destination.seasonalNote}</p>
              </div>
            ) : null}

            <SourceList sources={destination.sources} />

            <section className="mt-10" aria-labelledby="attractions-nearby">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <h2 id="attractions-nearby" className="text-[19px] font-bold text-forest-900">
                  Attractions nearby
                </h2>
                <Link href="/attractions" className="text-[12px] font-semibold text-river-700 hover:underline">
                  All attractions
                </Link>
              </div>
              {attractions.length ? (
                <ul className="mt-3 divide-y divide-ink-900/8 overflow-hidden rounded-2xl border border-ink-900/8 bg-white">
                  {attractions.map((attraction) => (
                    <li key={attraction.id}>
                      <Link
                        href={`/attractions/${attraction.slug}`}
                        className="group flex items-start justify-between gap-3 px-4 py-3 transition-colors hover:bg-forest-50/60"
                      >
                        <span className="min-w-0">
                          <span className="block text-[13.5px] font-semibold text-forest-900">{attraction.nameEn}</span>
                          <span className="mt-0.5 block text-[11.5px] text-ink-400">
                            {attraction.category}
                            {attraction.feeNote ? ` · ${attraction.feeNote}` : ""}
                          </span>
                        </span>
                        <ArrowRight className="mt-1 size-3.5 shrink-0 text-ink-400 transition-transform group-hover:translate-x-0.5" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 rounded-xl border border-dashed border-ink-900/15 px-4 py-6 text-center text-[12.5px] text-ink-500">
                  We have not recorded individual attractions here yet. The district page lists what is known.
                </p>
              )}
            </section>
          </div>

          <aside className="space-y-4">
            <div className="card p-5">
              <p className="eyebrow mb-2">At a glance</p>
              <ul className="space-y-2.5 text-[12.5px] text-ink-500">
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-3.5 shrink-0 text-forest-600" aria-hidden />
                  <span>
                    {destination.districtName ?? "District not set"}
                    {destination.division ? `, ${destination.division} Division` : ""}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CalendarDays className="mt-0.5 size-3.5 shrink-0 text-forest-600" aria-hidden />
                  <span>{destination.bestTime ?? "Best time not recorded."}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Mountain className="mt-0.5 size-3.5 shrink-0 text-forest-600" aria-hidden />
                  <span>{destination.category}</span>
                </li>
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/map?focus=${destination.slug}`}
                  className="btn btn-ghost px-3.5 py-2 text-[12px]"
                >
                  <MapPin className="size-3.5" aria-hidden /> Map
                </Link>
                <Link
                  href={`/packages?destination=${destination.slug}`}
                  className="btn btn-ghost px-3.5 py-2 text-[12px]"
                >
                  Trip templates
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-forest-100 bg-forest-50 p-5">
              <p className="text-[13px] font-bold text-forest-900">Not sure this is the right place?</p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-forest-700">
                Ask BanglaVoyage AI to compare it with somewhere else, or to suggest an alternative if the season is
                wrong. It answers in Bangla or English and never claims to book anything.
              </p>
              <Link href="/ai-travel-agent" className="btn btn-primary mt-3 w-full px-4 py-2 text-[12.5px]">
                <Sparkles className="size-3.5" aria-hidden /> Ask the AI agent
              </Link>
            </div>

            <p className="rounded-xl border border-ink-900/8 bg-white px-3.5 py-3 text-[11px] leading-relaxed text-ink-400">
              Page language:{" "}
              <Link href={lang === "en" ? "?lang=bn" : "?lang=en"} className="font-semibold text-river-700 underline">
                {lang === "en" ? "বাংলায় দেখুন" : "View in English"}
              </Link>
              . Bangla destination summaries are shown where available.
            </p>
          </aside>
        </div>

        {related.length ? (
          <section className="page mt-14 border-t border-ink-900/8 pt-10 pb-16">
            <SectionHeading eyebrow="Keep going" title="Places that pair well with this one" />
            <Reveal>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <DestinationCard key={item.slug} destination={item} sizes="(max-width:768px) 90vw, 30vw" />
                ))}
              </div>
            </Reveal>
          </section>
        ) : (
          <div className="pb-16" />
        )}
      </article>
    </main>
  );
}
