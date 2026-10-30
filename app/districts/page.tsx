import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, ShieldCheck } from "lucide-react";
import { DistrictsDirectory } from "@/components/districts-directory";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/ui/primitives";
import { getDbOrNull } from "@/lib/db";
import { getDistrictAttractionCounts, getDistricts } from "@/lib/queries";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All 64 districts of Bangladesh — travel directory",
  description:
    "A complete, searchable directory of Bangladesh's 64 districts: what to see, local food, transport, daily budgets and practical travel notes.",
  alternates: { canonical: "/districts", languages: { "en-BD": "/districts", "bn-BD": "/districts?lang=bn" } },
  openGraph: {
    title: "All 64 districts of Bangladesh",
    description: "Every district, with attractions, food, transport and honest cost guidance.",
    url: absoluteUrl("/districts"),
  },
};

const DIVISION_INTRO: Record<string, string> = {
  Dhaka: "The political and commercial centre, from Mughal lanes to the Padma bridge.",
  Chattogram: "Hills, beaches and the busiest port in the country.",
  Khulna: "The Sundarbans, the coast and the great delta rivers.",
  Rajshahi: "Mango orchards, Buddhist viharas and silk towns on the Padma.",
  Barishal: "Guava orchards, floating markets and southern river life.",
  Sylhet: "Tea gardens, haors and shrines in the north-east.",
  Rangpur: "Quiet northern plains, rajbaris and the Teesta.",
  Mymensingh: "Old Brahmaputra towns, forests and the Garo foothills.",
};

export default async function DistrictsPage() {
  const db = await getDbOrNull();
  if (!db) {
    return (
      <main id="main">
        <PageHeader
          eyebrow="64 districts"
          title="Every district, one directory"
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Districts" }]}
        />
        <div className="page py-10">
          <EmptyState title="The database is not connected" description="Apply the migration and seed data, then reload." />
        </div>
      </main>
    );
  }

  const [rows, counts] = await Promise.all([getDistricts(db), getDistrictAttractionCounts(db)]);

  const items = rows.map((row) => ({
    slug: row.slug,
    nameEn: row.nameEn,
    nameBn: row.nameBn,
    division: row.division,
    tagline: row.tagline,
    image: row.image,
    attractions: counts.get(row.id) ?? 0,
  }));

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Districts of Bangladesh",
    numberOfItems: items.length,
    itemListElement: items.map((district, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/districts/${district.slug}`),
      name: district.nameEn,
    })),
  };

  return (
    <main id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <PageHeader
        eyebrow="The whole country"
        title="Explore all 64 districts"
        description="Search by name in Bangla or English, filter by division, then open a district for attractions, food, transport, budgets and travel notes."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Districts" }]}
      >
        <div className="flex flex-wrap gap-2">
          <Link href="/destinations" className="btn btn-ghost px-4 py-2 text-[12.5px]">
            Featured destinations <ArrowRight className="size-3.5" aria-hidden />
          </Link>
          <Link href="/map" className="btn btn-ghost px-4 py-2 text-[12.5px]">
            <MapPin className="size-3.5" aria-hidden /> Map explorer
          </Link>
        </div>
      </PageHeader>

      <div className="page py-8">
        <div className="mb-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(DIVISION_INTRO).map(([division, intro]) => {
            const count = rows.filter((row) => row.division === division).length;
            return (
              <div key={division} className="rounded-xl border border-ink-900/8 bg-white px-3.5 py-3">
                <p className="text-[12.5px] font-bold text-forest-900">
                  {division} <span className="font-normal text-ink-400">· {count}</span>
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-ink-500">{intro}</p>
              </div>
            );
          })}
        </div>

        <DistrictsDirectory districts={items} />

        <p className="mt-7 flex items-start gap-2 rounded-xl border border-forest-100 bg-forest-50 px-3.5 py-3 text-[11.5px] leading-relaxed text-forest-700">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          District pages are editorial seed content built from public sources. Attraction counts include district
          highlights as well as individually researched sites. Verify opening hours, fees and access with the site or
          local authority before travelling.
        </p>
      </div>
    </main>
  );
}
