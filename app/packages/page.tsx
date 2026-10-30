import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight, BadgeCheck, ExternalLink, Phone } from "lucide-react";
import { PackageCard } from "@/components/cards";
import { FilterLinks } from "@/components/filters";
import { InquiryForm } from "@/components/inquiry-form";
import { PageHeader } from "@/components/page-header";
import { Badge, ConfidenceNote, EmptyState, SectionHeading } from "@/components/ui/primitives";
import { getDbOrNull } from "@/lib/db";
import { getDestinationOptions, getListings, getPackages } from "@/lib/queries";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bangladesh tour packages and trip templates",
  description:
    "Costed trip templates for Cox's Bazar, the Sundarbans, Sylhet, Sajek, Kuakata and heritage circuits — plus a directory of hotels, operators and transport. Estimates, not live quotes.",
  alternates: { canonical: "/packages" },
  openGraph: { title: "Bangladesh tour packages and trip templates", url: absoluteUrl("/packages") },
};

const TYPE_LABELS: Record<string, string> = {
  hotel: "Hotels and resorts",
  guesthouse: "Guesthouses and homestays",
  tour_operator: "Tour operators",
  guide: "Local guides",
  bus: "Bus services",
  train: "Train information",
  flight: "Domestic flights",
  launch: "Launch and boat operators",
  car_rental: "Car rental",
};

export default async function PackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ destination?: string }>;
}) {
  const params = await searchParams;
  const db = await getDbOrNull();
  if (!db) {
    return (
      <main id="main">
        <PageHeader eyebrow="Trip templates" title="Packages and directory" breadcrumbs={[{ label: "Home", href: "/" }, { label: "Packages" }]} />
        <div className="page py-10">
          <EmptyState title="The database is not connected" description="Apply the migration and seed data, then reload." />
        </div>
      </main>
    );
  }

  const selected = params.destination;
  const [packageRows, destinationOptions, listingRows] = await Promise.all([
    getPackages(db, { limit: 30 }),
    getDestinationOptions(db),
    getListings(db, { limit: 60 }),
  ]);

  const filtered = selected
    ? packageRows.filter((row) => row.destinationSlug === selected)
    : packageRows;
  const selectedName = destinationOptions.find((destination) => destination.slug === selected)?.nameEn;

  const grouped = new Map<string, typeof listingRows>();
  for (const row of listingRows) {
    const key = row.listing.type;
    grouped.set(key, [...(grouped.get(key) ?? []), row]);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Bangladesh trip templates",
    itemListElement: filtered.map((row, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/packages/${row.pkg.slug}`),
      name: row.pkg.title,
    })),
  };

  return (
    <main id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHeader
        eyebrow="Costed outlines"
        title="Trip templates, not sales pitches"
        description="These are outlines we costed with our own model. Nobody is named as an operator until we have verified them, and no departure date is shown as available. Verify everything with the provider before paying."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Packages" }]}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/trip-planner" className="btn btn-primary px-4 py-2 text-[12.5px]">
            Build your own plan
          </Link>
          <a href="#directory" className="btn btn-ghost px-4 py-2 text-[12.5px]">
            Hotels, operators and transport <ArrowRight className="size-3.5" aria-hidden />
          </a>
        </div>
      </PageHeader>

      <div className="page py-8">
        <FilterLinks
          basePath="/packages"
          param="destination"
          allLabel={`All templates (${packageRows.length})`}
          current={selected}
          options={destinationOptions
            .filter((destination) => packageRows.some((row) => row.destinationSlug === destination.slug))
            .map((destination) => ({ value: destination.slug, label: destination.nameEn }))}
        />

        <div className="mt-6">
          <SectionHeading
            eyebrow={selectedName ? `Filtered to ${selectedName}` : "Eight starting points"}
            title={selectedName ? `${selectedName} trip templates` : "Trip templates"}
            description="Each template links to a full breakdown of what is included, what is not, and how the estimate was calculated."
          />
          {filtered.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((row) => (
                <PackageCard key={row.pkg.id} pkg={row.pkg} destinationName={row.destinationName} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No template for that destination yet"
              description="Build a custom plan instead — the planner works from the destination data and your dates."
              action={
                <Link href="/trip-planner" className="btn btn-primary px-4 py-2 text-[13px]">
                  Open the planner
                </Link>
              }
            />
          )}
        </div>

        <div className="mt-6">
          <ConfidenceNote kind="estimate" />
          <p className="mt-2 flex items-start gap-2 rounded-xl border border-sunset-100 bg-sunset-100/40 px-3.5 py-3 text-[11.5px] leading-relaxed text-ink-700">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-sunset-600" aria-hidden />
            No booking, payment or reservation takes place on this site. If a template interests you, send an inquiry and
            we will point you to a licensed operator — or contact one directly.
          </p>
        </div>

        <section id="directory" className="mt-14 scroll-mt-24 border-t border-ink-900/8 pt-10" aria-labelledby="directory-title">
          <SectionHeading
            eyebrow="Travel directory"
            title="Hotels, operators and transport"
            description="Directory entries, not partners. Verification status is shown per listing; contact details are the operator's own. Always confirm rates and credentials before paying."
          />

          <div className="grid gap-5 lg:grid-cols-2">
            {[...grouped.entries()]
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([type, rows]) => (
                <div key={type} className="card p-5">
                  <h3 className="text-[15px] font-bold text-forest-900">{TYPE_LABELS[type] ?? type.replace(/_/g, " ")}</h3>
                  <ul className="mt-3 space-y-3">
                    {rows.map(({ listing, districtName }) => (
                      <li key={listing.id} className="border-b border-ink-900/5 pb-3 last:border-0 last:pb-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[13.5px] font-semibold text-forest-900">{listing.name}</p>
                          {listing.verification === "verified" ? (
                            <Badge tone="forest">
                              <BadgeCheck className="size-3" aria-hidden /> Verified
                            </Badge>
                          ) : (
                            <Badge tone="outline">Unverified</Badge>
                          )}
                        </div>
                        <p className="mt-0.5 text-[11.5px] text-ink-400">
                          {[listing.address, districtName].filter(Boolean).join(" · ")}
                        </p>
                        {listing.description ? (
                          <p className="mt-1 text-[12px] leading-relaxed text-ink-500">{listing.description}</p>
                        ) : null}
                        {listing.priceNote ? <p className="mt-1 text-[11px] text-ink-400">{listing.priceNote}</p> : null}
                        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px]">
                          {listing.phone ? (
                            <a href={`tel:${listing.phone}`} className="inline-flex items-center gap-1 font-semibold text-river-700 hover:underline">
                              <Phone className="size-3" aria-hidden /> {listing.phone}
                            </a>
                          ) : null}
                          {listing.website ? (
                            <a
                              href={listing.website}
                              target="_blank"
                              rel="noopener noreferrer nofollow"
                              className="inline-flex items-center gap-1 font-semibold text-river-700 hover:underline"
                            >
                              Website <ExternalLink className="size-2.5" aria-hidden />
                            </a>
                          ) : null}
                          {listing.bookingUrl ? (
                            <a
                              href={listing.bookingUrl}
                              target="_blank"
                              rel="noopener noreferrer nofollow"
                              className="inline-flex items-center gap-1 font-semibold text-river-700 hover:underline"
                            >
                              External booking page <ExternalLink className="size-2.5" aria-hidden />
                            </a>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-2xl border border-ink-900/8 bg-white p-5">
              <p className="eyebrow mb-2">Something missing?</p>
              <h3 className="text-[16px] font-bold text-forest-900">Suggest a listing or correct an entry</h3>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-500">
                We only list businesses we can point to a source for. If you run a guesthouse, boat or guide service,
                send the details and a way to verify them. Inclusion is editorial and free.
              </p>
              <ul className="mt-3 space-y-1.5 text-[11.5px] leading-relaxed text-ink-500">
                <li>· Trade licence or tourism registration details</li>
                <li>· A phone number and address we can cross-check</li>
                <li>· What you actually provide, and your typical rates</li>
              </ul>
            </div>
            <div className="card p-5">
              <p className="eyebrow mb-2">Inquiry</p>
              <InquiryForm type="listing" subject="Directory listing or correction" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
