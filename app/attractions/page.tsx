import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Search } from "lucide-react";
import { FilterLinks, Pagination } from "@/components/filters";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/ui/primitives";
import { getDbOrNull } from "@/lib/db";
import { getAttractionFacets, getAttractions } from "@/lib/queries";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

export const metadata: Metadata = {
  title: "Attractions in Bangladesh — sites, parks and monuments",
  description:
    "Browse 150+ attractions across Bangladesh by category: beaches, waterfalls, forests, mosques, museums and archaeological sites, with honest fee notes.",
  alternates: { canonical: "/attractions" },
  openGraph: { title: "Attractions in Bangladesh", url: absoluteUrl("/attractions") },
};

export default async function AttractionsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const db = await getDbOrNull();
  if (!db) {
    return (
      <main id="main">
        <PageHeader eyebrow="Attractions" title="Sites across the country" breadcrumbs={[{ label: "Home", href: "/" }, { label: "Attractions" }]} />
        <div className="page py-10">
          <EmptyState title="The database is not connected" description="Apply the migration and seed data, then reload." />
        </div>
      </main>
    );
  }

  const query = (params.q ?? "").trim().slice(0, 60);
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const [facets, rows] = await Promise.all([
    getAttractionFacets(db),
    getAttractions(db, { category: params.category, q: query || undefined, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
  ]);

  const totalPages = Math.max(1, Math.ceil(facets.total / PAGE_SIZE));
  const matchCount = params.category
    ? (facets.categories.find((item) => item.value === params.category)?.count ?? facets.total)
    : facets.total;

  return (
    <main id="main">
      <PageHeader
        eyebrow="Places and sites"
        title="Attractions across Bangladesh"
        description="Every entry says where the information comes from and whether the fee has been verified. Treat entry fees and hours as things to confirm, not facts to rely on."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Attractions" }]}
      >
        <form action="/attractions" className="flex max-w-xl items-center gap-2">
          <label htmlFor="attraction-search" className="sr-only">
            Search attractions
          </label>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
            <input id="attraction-search" name="q" defaultValue={query} placeholder="Search a site or monument" className="field pl-9" />
          </div>
          {params.category ? <input type="hidden" name="category" value={params.category} /> : null}
          <button type="submit" className="btn btn-primary px-4 py-2.5 text-[13px]">
            Search
          </button>
        </form>
      </PageHeader>

      <div className="page py-8">
        <FilterLinks
          basePath="/attractions"
          param="category"
          allLabel={`All ${facets.total} attractions`}
          current={params.category}
          options={facets.categories}
          params={{ q: query || undefined }}
        />

        <p className="mt-4 text-[13px] text-ink-500" aria-live="polite">
          {matchCount} attractions{params.category ? ` in ${params.category}` : ""}
          {query ? ` matching “${query}”` : ""}
        </p>

        {rows.length ? (
          <ul className="mt-4 divide-y divide-ink-900/8 overflow-hidden rounded-2xl border border-ink-900/8 bg-white">
            {rows.map(({ attraction, districtName, districtSlug }) => (
              <li key={attraction.id}>
                <Link href={`/attractions/${attraction.slug}`} className="group flex items-start gap-4 px-4 py-4 transition-colors hover:bg-forest-50/50 sm:px-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <h2 className="text-[14.5px] font-semibold text-forest-900">{attraction.nameEn}</h2>
                      <span className="rounded-full bg-sunset-100 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.1em] text-sunset-600">
                        {attraction.category}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-ink-500">{attraction.description}</p>
                    <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-400">
                      {districtSlug ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3" aria-hidden /> {districtName}
                        </span>
                      ) : null}
                      <span>{attraction.feeNote ?? "Fee note not recorded"}</span>
                    </p>
                  </div>
                  <ArrowRight className="mt-1 size-4 shrink-0 text-ink-400 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-5">
            <EmptyState
              title="No attractions matched"
              description="Try a different category or search for a district name such as Sylhet, Khulna or Rangamati."
              action={
                <Link href="/attractions" className="btn btn-primary px-4 py-2 text-[13px]">
                  Clear filters
                </Link>
              }
            />
          </div>
        )}

        <Pagination
          basePath="/attractions"
          page={page}
          totalPages={totalPages}
          params={{ category: params.category, q: query || undefined }}
        />
      </div>
    </main>
  );
}
