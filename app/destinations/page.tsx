import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Search } from "lucide-react";
import { DestinationCard } from "@/components/cards";
import { FilterLinks } from "@/components/filters";
import { PageHeader } from "@/components/page-header";
import { EmptyState, SectionHeading } from "@/components/ui/primitives";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/reveal";
import { getDbOrNull } from "@/lib/db";
import { getDestinationFacets, getDestinations, getExperiences } from "@/lib/queries";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Destinations in Bangladesh — places worth the journey",
  description:
    "Browse Bangladesh destinations by category and region: Cox's Bazar, the Sundarbans, Sylhet tea country, Sajek, Bandarban, Kuakata, Saint Martin's and more.",
  alternates: { canonical: "/destinations", languages: { "en-BD": "/destinations", "bn-BD": "/destinations?lang=bn" } },
  openGraph: {
    title: "Destinations in Bangladesh",
    description: "Twelve in-depth destination guides, honest seasonal notes and practical access information.",
    url: absoluteUrl("/destinations"),
  },
};

export default async function DestinationsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; region?: string; q?: string }>;
}) {
  const params = await searchParams;
  const db = await getDbOrNull();
  if (!db) {
    return (
      <main id="main">
        <PageHeader
          eyebrow="Destinations"
          title="Places worth the journey"
          description="Destination guides read from the live database."
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Destinations" }]}
        />
        <div className="page py-10">
          <EmptyState
            title="The database is not connected"
            description="Apply the migration and seed data, then reload. Run npm run db:migrate:local and npm run db:seed:local."
          />
        </div>
      </main>
    );
  }

  const query = (params.q ?? "").trim().slice(0, 60);
  const [rows, facets, experiences] = await Promise.all([
    getDestinations(db, { category: params.category, region: params.region, q: query || undefined, limit: 60, order: "featured" }),
    getDestinationFacets(db),
    getExperiences(db),
  ]);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Bangladesh travel destinations",
    numberOfItems: rows.length,
    itemListElement: rows.map((destination, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/destinations/${destination.slug}`),
      name: destination.nameEn,
    })),
  };

  return (
    <main id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <PageHeader
        eyebrow="Where to go"
        title="Destinations across Bangladesh"
        description="Every guide below is written from our destination records, with sources and seasonal caveats. Prices and access are estimates until you confirm them with the operator or authority."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Destinations" }]}
      >
        <form action="/destinations" className="flex max-w-xl items-center gap-2">
          <label htmlFor="destination-search" className="sr-only">
            Search destinations
          </label>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
            <input
              id="destination-search"
              name="q"
              defaultValue={query}
              placeholder="Search a place, region or category"
              className="field pl-9"
            />
          </div>
          {params.category ? <input type="hidden" name="category" value={params.category} /> : null}
          <button type="submit" className="btn btn-primary px-4 py-2.5 text-[13px]">
            Search
          </button>
        </form>
      </PageHeader>

      <div className="page py-8">
        <div className="space-y-3">
          <FilterLinks
            basePath="/destinations"
            param="category"
            allLabel={`All categories (${facets.categories.reduce((sum, item) => sum + item.count, 0)})`}
            current={params.category}
            options={facets.categories}
            params={{ region: params.region, q: query || undefined }}
          />
          <FilterLinks
            basePath="/destinations"
            param="region"
            allLabel="Every region"
            current={params.region}
            options={facets.regions}
            params={{ category: params.category, q: query || undefined }}
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] text-ink-500" aria-live="polite">
            {rows.length} destination{rows.length === 1 ? "" : "s"}
            {query ? ` matching “${query}”` : ""}
            {params.category ? ` in ${params.category}` : ""}
            {params.region ? ` · ${params.region}` : ""}
          </p>
          <div className="flex gap-2">
            <Link href="/map" className="btn btn-ghost px-3.5 py-2 text-[12px]">
              <MapPin className="size-3.5" aria-hidden /> Open the map
            </Link>
            <Link href="/districts" className="btn btn-ghost px-3.5 py-2 text-[12px]">
              All 64 districts <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </div>

        {rows.length ? (
          <StaggerGroup className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((destination, index) => (
              <StaggerItem key={destination.slug}>
                <DestinationCard destination={destination} priority={index < 3} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        ) : (
          <div className="mt-6">
            <EmptyState
              title="No destinations match those filters"
              description="Try clearing the region filter, searching a district name, or browsing every destination."
              action={
                <Link href="/destinations" className="btn btn-primary px-4 py-2 text-[13px]">
                  Clear filters
                </Link>
              }
            />
          </div>
        )}

        <section className="mt-14 border-t border-ink-900/8 pt-10" aria-labelledby="by-experience">
          <SectionHeading
            eyebrow="Or start with a feeling"
            title="Browse by experience"
            description="The same country, thirteen different trips. Each experience page links to destinations that suit it."
            action={
              <Link href="/experiences" className="btn btn-ghost text-[13px]">
                All experiences <ArrowRight className="size-4" aria-hidden />
              </Link>
            }
          />
          <Reveal>
            <div className="flex flex-wrap gap-2">
              {experiences.map((experience) => (
                <Link key={experience.slug} href={`/experiences#${experience.slug}`} className="chip text-[12.5px]">
                  {experience.nameEn}
                </Link>
              ))}
            </div>
          </Reveal>
        </section>
      </div>
    </main>
  );
}
