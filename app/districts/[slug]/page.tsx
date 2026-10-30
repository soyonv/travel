import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Bus,
  CalendarDays,
  MapPin,
  Phone,
  Sparkles,
  Utensils,
  Wallet,
} from "lucide-react";
import { ArticleCard, DestinationCard } from "@/components/cards";
import { PageHeader } from "@/components/page-header";
import { Badge, ConfidenceNote, EmptyState, SourceList } from "@/components/ui/primitives";
import { getDbOrNull } from "@/lib/db";
import {
  getArticleBySlug,
  getArticlesByDistrict,
  getAttractionsByDistrict,
  getDestinationsByDistrict,
  getDistrictBySlug,
  getListings,
} from "@/lib/queries";
import { calculateBudget } from "@/lib/budget";
import { formatBDT, absoluteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const db = await getDbOrNull();
  if (!db) return { title: "District" };
  const district = await getDistrictBySlug(db, slug).catch(() => null);
  if (!district) return { title: "District not found" };
  const description = (district.introEn ?? "").slice(0, 158);
  return {
    title: `${district.nameEn} district travel guide`,
    description,
    alternates: {
      canonical: `/districts/${district.slug}`,
      languages: { "en-BD": `/districts/${district.slug}`, "bn-BD": `/districts/${district.slug}?lang=bn` },
    },
    openGraph: {
      title: `${district.nameEn} district travel guide`,
      description,
      url: absoluteUrl(`/districts/${district.slug}`),
    },
  };
}

export default async function DistrictPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDbOrNull();
  if (!db) {
    return (
      <main id="main">
        <div className="page py-16">
          <EmptyState title="The district database is not connected" description="Apply the migration and seed data, then reload." />
        </div>
      </main>
    );
  }

  const district = await getDistrictBySlug(db, slug);
  if (!district) notFound();

  const [attractions, destinations, articles, hotelRows] = await Promise.all([
    getAttractionsByDistrict(db, district.id),
    getDestinationsByDistrict(db, district.id),
    getArticlesByDistrict(db, district.id, 3),
    getListings(db, { districtId: district.id, limit: 12 }),
  ]);

  const featuredGuide = await getArticleBySlug(db, "bangladesh-travel-budget").catch(() => null);
  const related = articles.length ? articles : featuredGuide ? [featuredGuide] : [];

  const budgetSample = calculateBudget({
    days: 3,
    travelers: 2,
    style: "standard",
    transport: "bus",
    accommodation: "hotel",
  });

  const itinerary = [...attractions].slice(0, 4);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AdministrativeArea",
    name: district.nameEn,
    alternateName: district.nameBn,
    description: district.introEn,
    url: absoluteUrl(`/districts/${district.slug}`),
    containedInPlace: { "@type": "Country", name: "Bangladesh" },
  };

  return (
    <main id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <PageHeader
        eyebrow={`${district.division} Division`}
        title={
          <>
            {district.nameEn} <span className="font-bangla text-[0.6em] text-ink-400" lang="bn">{district.nameBn}</span>
          </>
        }
        description={district.tagline ?? undefined}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Districts", href: "/districts" },
          { label: district.nameEn },
        ]}
      >
        <div className="flex flex-wrap gap-2">
          <Badge tone="forest">
            <MapPin className="size-3" aria-hidden /> {district.division} Division
          </Badge>
          {district.bestSeason ? (
            <Badge tone="neutral">
              <CalendarDays className="size-3" aria-hidden /> {district.bestSeason}
            </Badge>
          ) : null}
          {district.dailyBudgetBdt ? (
            <Badge tone="sunset">
              <Wallet className="size-3" aria-hidden /> about {formatBDT(district.dailyBudgetBdt)} / day
            </Badge>
          ) : null}
        </div>
      </PageHeader>

      <div className="page grid gap-10 py-9 lg:grid-cols-[1.4fr_0.85fr]">
        <div>
          <section aria-labelledby="intro">
            <h2 id="intro" className="display text-[1.6rem] text-forest-900">
              Introduction
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-700">{district.introEn}</p>
            {district.introBn ? (
              <p className="mt-4 rounded-xl border border-ink-900/8 bg-white px-4 py-3 text-[13.5px] leading-relaxed text-ink-500" lang="bn">
                {district.introBn}
              </p>
            ) : null}
          </section>

          <section className="mt-9" aria-labelledby="district-attractions">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 id="district-attractions" className="display text-[1.6rem] text-forest-900">
                What to see
              </h2>
              <Link href="/attractions" className="text-[12px] font-semibold text-river-700 hover:underline">
                All attractions
              </Link>
            </div>
            {attractions.length ? (
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {attractions.map((attraction) => (
                  <Link
                    key={attraction.id}
                    href={`/attractions/${attraction.slug}`}
                    className="group rounded-xl border border-ink-900/8 bg-white p-3.5 transition-all hover:border-forest-400 hover:shadow-sm"
                  >
                    <p className="flex items-start justify-between gap-2 text-[13.5px] font-semibold text-forest-900">
                      {attraction.nameEn}
                      <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-ink-400 transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </p>
                    <p className="mt-0.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-sunset-600">
                      {attraction.category}
                    </p>
                    <p className="mt-1.5 line-clamp-3 text-[12px] leading-relaxed text-ink-500">{attraction.description}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-xl border border-dashed border-ink-900/15 px-4 py-6 text-center text-[12.5px] text-ink-500">
                No attractions recorded for this district yet.
              </p>
            )}
          </section>

          {destinations.length ? (
            <section className="mt-9" aria-labelledby="district-destinations">
              <h2 id="district-destinations" className="display text-[1.6rem] text-forest-900">
                In-depth destination guides
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {destinations.map((destination) => (
                  <DestinationCard key={destination.slug} destination={destination} sizes="(max-width:768px) 90vw, 40vw" />
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-9" aria-labelledby="food-culture">
            <h2 id="food-culture" className="display text-[1.6rem] text-forest-900">
              Local food
            </h2>
            {(district.foods ?? []).length ? (
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {(district.foods ?? []).map((food) => (
                  <li key={food} className="flex items-start gap-2 rounded-xl bg-ivory-100/70 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-ink-700">
                    <Utensils className="mt-0.5 size-3.5 shrink-0 text-forest-600" aria-hidden />
                    {food}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-[13px] text-ink-500">Local dishes are not recorded yet for this district.</p>
            )}
            <p className="mt-3 text-[11.5px] leading-relaxed text-ink-400">
              Dietary needs are not verified here. If you avoid certain ingredients, carry a written Bangla note and ask
              before ordering.
            </p>
          </section>

          <section className="mt-9" aria-labelledby="getting-there">
            <h2 id="getting-there" className="display text-[1.6rem] text-forest-900">
              Getting there
            </h2>
            <p className="mt-3 flex items-start gap-2 text-[14px] leading-relaxed text-ink-700">
              <Bus className="mt-0.5 size-4 shrink-0 text-forest-600" aria-hidden />
              {district.transport ?? "Transport information is not recorded for this district yet."}
            </p>
            <p className="mt-2 text-[11.5px] leading-relaxed text-ink-400">
              Journey times are indicative. Check current schedules with the operator; road and river conditions change
              seasonally.
            </p>
          </section>

          <section className="mt-9" aria-labelledby="district-itinerary">
            <h2 id="district-itinerary" className="display text-[1.6rem] text-forest-900">
              A simple outline
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-500">
              A starting point, not a schedule. Build a real one with travel times and your own dates in the planner.
            </p>
            <ol className="mt-4 space-y-2">
              <li className="rounded-xl border border-ink-900/8 bg-white px-4 py-3">
                <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-sunset-600">Day 1</p>
                <p className="mt-1 text-[13.5px] text-ink-700">
                  Arrive, settle in near the town centre, and take a short orientation walk. Eat locally.
                </p>
              </li>
              {itinerary.slice(0, 3).map((attraction, index) => (
                <li key={attraction.id} className="rounded-xl border border-ink-900/8 bg-white px-4 py-3">
                  <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-sunset-600">Day {index + 2}</p>
                  <p className="mt-1 text-[13.5px] text-ink-700">
                    {attraction.nameEn} — {attraction.description.slice(0, 150)}
                  </p>
                </li>
              ))}
              <li className="rounded-xl border border-ink-900/8 bg-white px-4 py-3">
                <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-sunset-600">
                  Day {Math.min(itinerary.length, 3) + 2}
                </p>
                <p className="mt-1 text-[13.5px] text-ink-700">
                  Market morning, then return. Leave at least three hours before any onward flight.
                </p>
              </li>
            </ol>
            <Link href={`/trip-planner?district=${district.slug}`} className="btn btn-primary mt-4 px-4 py-2 text-[12.5px]">
              <Sparkles className="size-3.5" aria-hidden /> Build a dated itinerary
            </Link>
          </section>

          {(district.tips ?? []).length ? (
            <section className="mt-9" aria-labelledby="district-tips">
              <h2 id="district-tips" className="display text-[1.6rem] text-forest-900">
                Travel notes
              </h2>
              <ul className="mt-3 space-y-2">
                {(district.tips ?? []).map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-[13px] leading-relaxed text-ink-700">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-forest-400" aria-hidden />
                    {tip}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <SourceList sources={district.sources} />
          <div className="mt-4">
            <ConfidenceNote kind="seed" />
          </div>
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <p className="eyebrow mb-2">Estimated costs</p>
            <p className="text-[12.5px] leading-relaxed text-ink-500">
              Two travellers, three days, standard style, coach from Dhaka.
            </p>
            <p className="display mt-3 text-3xl text-forest-900">{formatBDT(budgetSample.groupTotal)}</p>
            <p className="text-[11.5px] text-ink-400">
              {formatBDT(budgetSample.perPerson)} per person · {formatBDT(budgetSample.perPersonPerDay)} per day
            </p>
            <dl className="mt-4 space-y-1.5 border-t border-ink-900/8 pt-3 text-[11.5px]">
              {budgetSample.lines.slice(0, 5).map((line) => (
                <div key={line.key} className="flex justify-between gap-2">
                  <dt className="text-ink-500">{line.label}</dt>
                  <dd className="font-semibold text-ink-700">{formatBDT(line.amount)}</dd>
                </div>
              ))}
            </dl>
            <ConfidenceNote kind="estimate" className="mt-3" />
            <Link href={`/budget-calculator?district=${district.slug}`} className="btn btn-ghost mt-3 w-full px-4 py-2 text-[12.5px]">
              <Wallet className="size-3.5" aria-hidden /> Adjust the numbers
            </Link>
          </div>

          <div className="card p-5">
            <p className="eyebrow mb-2">Where to stay</p>
            {hotelRows.length ? (
              <ul className="space-y-3">
                {hotelRows.slice(0, 5).map(({ listing }) => (
                  <li key={listing.id} className="border-b border-ink-900/5 pb-2.5 last:border-0 last:pb-0">
                    <p className="text-[13px] font-semibold text-forest-900">{listing.name}</p>
                    <p className="text-[11.5px] text-ink-500">{listing.type.replace(/_/g, " ")}</p>
                    {listing.priceNote ? <p className="text-[11px] text-ink-400">{listing.priceNote}</p> : null}
                    {listing.phone ? (
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-ink-400">
                        <Phone className="size-2.5" aria-hidden /> {listing.phone}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[12.5px] leading-relaxed text-ink-500">
                We do not have a verified accommodation listing for this district. Search a booking platform, or ask in a
                local Facebook travel group — and confirm the address before paying a deposit.
              </p>
            )}
            <p className="mt-3 text-[10.5px] leading-relaxed text-ink-400">
              Listings are directory entries, not booking partners. Rates and availability are unverified.
            </p>
            <Link href="/packages#directory" className="mt-3 inline-flex text-[11.5px] font-semibold text-river-700 underline">
              Full travel directory
            </Link>
          </div>

          <div className="card p-5">
            <p className="eyebrow mb-2">Location</p>
            {typeof district.lat === "number" && typeof district.lon === "number" ? (
              <>
                <p className="text-[12px] text-ink-500">
                  {district.lat.toFixed(4)}° N, {district.lon.toFixed(4)}° E
                </p>
                <Link href={`/map?focus=${district.slug}`} className="btn btn-ghost mt-3 w-full px-4 py-2 text-[12.5px]">
                  <MapPin className="size-3.5" aria-hidden /> Show on the map
                </Link>
              </>
            ) : (
              <p className="text-[12px] text-ink-500">Coordinates are not recorded for this district.</p>
            )}
          </div>

          {related.length ? (
            <div>
              <p className="eyebrow mb-2">Related reading</p>
              <div className="space-y-3">
                {related.slice(0, 2).map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          ) : null}

        </aside>
      </div>
    </main>
  );
}
