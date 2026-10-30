import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ExternalLink, MapPin, Ticket } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge, ConfidenceNote, EmptyState, SourceList } from "@/components/ui/primitives";
import { getDbOrNull } from "@/lib/db";
import { getAttractionBySlug, getAttractionsByDistrict } from "@/lib/queries";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const db = await getDbOrNull();
  if (!db) return { title: "Attraction" };
  const row = await getAttractionBySlug(db, slug).catch(() => null);
  if (!row) return { title: "Attraction not found" };
  return {
    title: `${row.attraction.nameEn} — visitor notes`,
    description: row.attraction.description.slice(0, 158),
    alternates: { canonical: `/attractions/${row.attraction.slug}` },
    openGraph: {
      title: `${row.attraction.nameEn} — visitor notes`,
      description: row.attraction.description.slice(0, 158),
      url: absoluteUrl(`/attractions/${row.attraction.slug}`),
    },
  };
}

export default async function AttractionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDbOrNull();
  if (!db) {
    return (
      <main id="main">
        <div className="page py-16">
          <EmptyState title="The attraction database is not connected" description="Apply the migration and seed data, then reload." />
        </div>
      </main>
    );
  }

  const row = await getAttractionBySlug(db, slug);
  if (!row) notFound();
  const { attraction } = row;

  const nearby = attraction.districtId ? await getAttractionsByDistrict(db, attraction.districtId) : [];
  const related = nearby.filter((item) => item.id !== attraction.id).slice(0, 5);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: attraction.nameEn,
    alternateName: attraction.nameBn ?? undefined,
    description: attraction.description,
    url: absoluteUrl(`/attractions/${attraction.slug}`),
    isAccessibleForFree: attraction.entryFeeBdt === 0 ? true : undefined,
    geo:
      typeof attraction.lat === "number" && typeof attraction.lon === "number"
        ? { "@type": "GeoCoordinates", latitude: attraction.lat, longitude: attraction.lon }
        : undefined,
  };

  return (
    <main id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHeader
        eyebrow={attraction.category}
        title={attraction.nameEn}
        description={attraction.nameBn ? <span lang="bn">{attraction.nameBn}</span> : undefined}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Attractions", href: "/attractions" },
          { label: attraction.nameEn },
        ]}
      >
        <div className="flex flex-wrap gap-2">
          {row.districtSlug ? (
            <Link href={`/districts/${row.districtSlug}`} className="chip text-[11.5px]">
              <MapPin className="size-3" aria-hidden /> {row.districtName} district
            </Link>
          ) : null}
          {row.destinationSlug ? (
            <Link href={`/destinations/${row.destinationSlug}`} className="chip text-[11.5px]">
              {row.destinationName} guide
            </Link>
          ) : null}
          <Badge tone="outline">{attraction.category}</Badge>
        </div>
      </PageHeader>

      <div className="page grid gap-8 py-8 lg:grid-cols-[1.4fr_0.85fr]">
        <div>
          <p className="text-[15.5px] leading-relaxed text-ink-700">{attraction.description}</p>

          <div className="mt-6 rounded-2xl border border-sunset-100 bg-sunset-100/40 px-4 py-3.5">
            <p className="flex items-center gap-1.5 text-[12.5px] font-bold text-forest-900">
              <Ticket className="size-3.5 text-sunset-600" aria-hidden /> Entry and timings
            </p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-ink-700">
              {attraction.feeNote ?? "No fee information has been recorded for this site."}
            </p>
            {typeof attraction.entryFeeBdt === "number" ? (
              <p className="mt-1 text-[11.5px] text-ink-500">
                Last recorded entry fee: ৳{attraction.entryFeeBdt}. Confirm at the gate.
              </p>
            ) : (
              <p className="mt-1 text-[11.5px] text-ink-500">No verified entry fee is stored for this site.</p>
            )}
          </div>

          <div className="mt-4">
            <ConfidenceNote kind={attraction.verifiedAt ? "verified" : "seed"} />
          </div>

          <SourceList sources={attraction.sources} />

          {related.length ? (
            <section className="mt-9" aria-labelledby="nearby-sites">
              <h2 id="nearby-sites" className="text-[18px] font-bold text-forest-900">
                More in {row.districtName ?? "this district"}
              </h2>
              <ul className="mt-3 divide-y divide-ink-900/8 overflow-hidden rounded-xl border border-ink-900/8 bg-white">
                {related.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/attractions/${item.slug}`}
                      className="group flex items-center justify-between gap-3 px-4 py-3 text-[13px] transition-colors hover:bg-forest-50/60"
                    >
                      <span>
                        <span className="font-semibold text-forest-900">{item.nameEn}</span>
                        <span className="ml-2 text-[11px] text-ink-400">{item.category}</span>
                      </span>
                      <ArrowRight className="size-3.5 shrink-0 text-ink-400 transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <p className="eyebrow mb-2">Plan around it</p>
            <p className="text-[12.5px] leading-relaxed text-ink-500">
              Ask the planner to build a day that includes this stop, with travel time and meal breaks.
            </p>
            <Link
              href={row.destinationSlug ? `/trip-planner?destination=${row.destinationSlug}` : "/trip-planner"}
              className="btn btn-primary mt-3 w-full px-4 py-2 text-[12.5px]"
            >
              Open the trip planner
            </Link>
            <Link href="/ai-travel-agent" className="btn btn-ghost mt-2 w-full px-4 py-2 text-[12.5px]">
              Ask BanglaVoyage AI
            </Link>
          </div>

          {typeof attraction.lat === "number" && typeof attraction.lon === "number" ? (
            <div className="card p-5">
              <p className="eyebrow mb-2">Location</p>
              <p className="text-[12px] text-ink-500">
                {attraction.lat.toFixed(4)}° N, {attraction.lon.toFixed(4)}° E
              </p>
              <a
                href={`https://www.openstreetmap.org/?mlat=${attraction.lat}&mlon=${attraction.lon}#map=13/${attraction.lat}/${attraction.lon}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost mt-3 w-full px-4 py-2 text-[12.5px]"
              >
                <MapPin className="size-3.5" aria-hidden /> OpenStreetMap
                <ExternalLink className="size-3" aria-hidden />
              </a>
              <Link href="/map" className="mt-2 block text-center text-[11.5px] font-semibold text-river-700 underline">
                Or use our map explorer
              </Link>
            </div>
          ) : null}

          {row.districtSlug ? (
            <Link href={`/districts/${row.districtSlug}`} className="card block p-5 transition-shadow hover:shadow-[var(--shadow-soft)]">
              <p className="eyebrow mb-1">District guide</p>
              <p className="text-[13.5px] font-semibold text-forest-900">Everything in {row.districtName}</p>
              <p className="mt-1 text-[12px] text-ink-500">Food, transport, budgets and other sites.</p>
            </Link>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
