import type { Metadata } from "next";
import Link from "next/link";
import { Compass, Info } from "lucide-react";
import { MapExplorer, type MapPoint } from "@/components/map/map-explorer";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/ui/primitives";
import { getDbOrNull } from "@/lib/db";
import { getAttractionsForMap, getMapPoints } from "@/lib/queries";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Map explorer — destinations and districts of Bangladesh",
  description:
    "Explore Bangladesh on an interactive map: destinations, all 64 districts and mapped attractions, filtered by category and synchronized with a list.",
  alternates: { canonical: "/map" },
  openGraph: { title: "Map explorer", url: absoluteUrl("/map") },
};

export default async function MapPage({ searchParams }: { searchParams: Promise<{ focus?: string }> }) {
  const params = await searchParams;
  const db = await getDbOrNull();
  if (!db) {
    return (
      <main id="main">
        <PageHeader eyebrow="Map" title="Explore the map" breadcrumbs={[{ label: "Home", href: "/" }, { label: "Map" }]} />
        <div className="page py-10">
          <EmptyState title="The database is not connected" description="Apply the migration and seed data, then reload." />
        </div>
      </main>
    );
  }

  const [basePoints, attractions] = await Promise.all([getMapPoints(db), getAttractionsForMap(db)]);

  const points: MapPoint[] = [
    ...basePoints
      .filter((point): point is typeof point & { lat: number; lon: number } => typeof point.lat === "number" && typeof point.lon === "number")
      .map((point) => ({
        slug: point.slug,
        name: point.name,
        nameBn: point.nameBn,
        kind: point.kind === "destination" ? ("destination" as const) : ("district" as const),
        category: point.category,
        lat: point.lat,
        lon: point.lon,
        summary: point.summary,
        href: point.kind === "destination" ? `/destinations/${point.slug}` : `/districts/${point.slug}`,
      })),
    ...attractions
      .filter((point): point is typeof point & { lat: number; lon: number } => typeof point.lat === "number" && typeof point.lon === "number")
      .map((point) => ({
        slug: point.slug,
        name: point.name,
        nameBn: null,
        kind: "attraction" as const,
        category: point.category,
        lat: point.lat,
        lon: point.lon,
        summary: point.districtName ? `${point.districtName} district` : null,
        href: `/attractions/${point.slug}`,
      })),
  ];

  return (
    <main id="main">
      <PageHeader
        eyebrow="Geography first"
        title="Map explorer"
        description="Pin the places you are considering, filter by kind, and open the full page for practical notes. Coordinates are approximate, and the base map is OpenStreetMap."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Map" }]}
      >
        <div className="flex flex-wrap gap-2">
          <Link href="/destinations" className="btn btn-ghost px-4 py-2 text-[12.5px]">
            <Compass className="size-3.5" aria-hidden /> Destination guides
          </Link>
          <Link href="/trip-planner" className="btn btn-primary px-4 py-2 text-[12.5px]">
            Plan a route
          </Link>
        </div>
      </PageHeader>

      <div className="page py-8">
        <MapExplorer points={points} focusSlug={params.focus} />

        <div className="mt-5 flex items-start gap-2 rounded-xl border border-ink-900/8 bg-white px-3.5 py-3 text-[11.5px] leading-relaxed text-ink-500">
          <Info className="mt-0.5 size-3.5 shrink-0 text-sunset-500" aria-hidden />
          <span>
            No routing engine is configured, so this map does not draw road routes or quote travel times. The itinerary
            builder estimates legs from our cost model and flags them as estimates. Map tiles and attribution belong to{" "}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-river-700 underline"
            >
              OpenStreetMap contributors
            </a>
            .
          </span>
        </div>
      </div>
    </main>
  );
}
