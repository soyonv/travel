import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowRight, CalendarDays, Check, MapPin, ShieldQuestion, Sparkles, Users, Wallet, X } from "lucide-react";
import { PackageCard } from "@/components/cards";
import { InquiryForm } from "@/components/inquiry-form";
import { PageHeader } from "@/components/page-header";
import { Badge, ConfidenceNote, EmptyState } from "@/components/ui/primitives";
import { getDbOrNull } from "@/lib/db";
import { getPackageBySlug, getPackages } from "@/lib/queries";
import { absoluteUrl, formatBDT } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const db = await getDbOrNull();
  if (!db) return { title: "Trip template" };
  const row = await getPackageBySlug(db, slug).catch(() => null);
  if (!row) return { title: "Trip template not found" };
  return {
    title: `${row.pkg.title} — ${row.pkg.durationDays}-day trip template`,
    description: row.pkg.summary.slice(0, 158),
    alternates: { canonical: `/packages/${row.pkg.slug}` },
    openGraph: {
      title: row.pkg.title,
      description: row.pkg.summary.slice(0, 158),
      url: absoluteUrl(`/packages/${row.pkg.slug}`),
      images: row.pkg.image ? [{ url: row.pkg.image }] : undefined,
    },
  };
}

export default async function PackageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDbOrNull();
  if (!db) {
    return (
      <main id="main">
        <div className="page py-16">
          <EmptyState title="The database is not connected" description="Apply the migration and seed data, then reload." />
        </div>
      </main>
    );
  }

  const row = await getPackageBySlug(db, slug);
  if (!row || row.pkg.status !== "published") notFound();
  const { pkg } = row;

  const others = (await getPackages(db, { limit: 4 })).filter((item) => item.pkg.id !== pkg.id).slice(0, 3);
  const verifiedOperator = pkg.operatorStatus === "verified" && pkg.operatorName;
  const dates = pkg.availableDates ?? [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: pkg.title,
    description: pkg.summary,
    url: absoluteUrl(`/packages/${pkg.slug}`),
    image: pkg.image ?? undefined,
    touristType: "General",
    itinerary: {
      "@type": "ItemList",
      numberOfItems: pkg.durationDays,
    },
  };

  return (
    <main id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="page pt-6">
        <nav aria-label="Breadcrumb" className="text-xs text-ink-400">
          <Link href="/" className="hover:text-forest-700">Home</Link>
          <span className="mx-1.5">/</span>
          <Link href="/packages" className="hover:text-forest-700">Trip templates</Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink-500">{pkg.title}</span>
        </nav>
      </div>

      <div className="page mt-4 grid gap-8 lg:grid-cols-[1.35fr_0.9fr]">
        <div>
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-forest-100">
            {pkg.image ? <Image src={pkg.image} alt={pkg.title} fill priority sizes="(max-width:1024px) 100vw, 60vw" className="object-cover" /> : null}
            <span className="absolute left-4 top-4 rounded-full bg-ivory-50/95 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-forest-800">
              Trip template · not a live product
            </span>
          </div>

          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="forest">
                <CalendarDays className="size-3" aria-hidden /> {pkg.durationDays} days
              </Badge>
              {pkg.groupSize ? (
                <Badge tone="neutral">
                  <Users className="size-3" aria-hidden /> {pkg.groupSize}
                </Badge>
              ) : null}
              {row.destinationName ? (
                <Link href={`/destinations/${row.destinationSlug}`} className="chip text-[11.5px]">
                  <MapPin className="size-3" aria-hidden /> {row.destinationName}
                </Link>
              ) : null}
            </div>

            <h1 className="display mt-3 text-[clamp(2rem,4vw,3rem)] text-forest-900">{pkg.title}</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-700">{pkg.summary}</p>

            {pkg.priceFromBdt ? (
              <div className="mt-5 rounded-2xl border border-ink-900/8 bg-white p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-400">From, per person (estimate)</p>
                <p className="display mt-1 text-3xl text-forest-900">{formatBDT(pkg.priceFromBdt)}</p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-ink-500">{pkg.priceNote}</p>
                <ConfidenceNote kind="estimate" className="mt-2" />
              </div>
            ) : null}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-forest-100 bg-forest-50 p-4">
                <p className="text-[12.5px] font-bold text-forest-900">Included</p>
                <ul className="mt-2 space-y-1.5">
                  {(pkg.includes ?? []).map((item) => (
                    <li key={item} className="flex items-start gap-1.5 text-[12px] leading-relaxed text-forest-700">
                      <Check className="mt-0.5 size-3.5 shrink-0" aria-hidden /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-ink-900/8 bg-white p-4">
                <p className="text-[12.5px] font-bold text-forest-900">Not included</p>
                <ul className="mt-2 space-y-1.5">
                  {(pkg.excludes ?? []).map((item) => (
                    <li key={item} className="flex items-start gap-1.5 text-[12px] leading-relaxed text-ink-500">
                      <X className="mt-0.5 size-3.5 shrink-0 text-sunset-500" aria-hidden /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <section className="mt-6 rounded-2xl border border-ink-900/8 bg-white p-4" aria-labelledby="operator-status">
              <h2 id="operator-status" className="flex items-center gap-1.5 text-[13px] font-bold text-forest-900">
                <ShieldQuestion className="size-3.5 text-sunset-600" aria-hidden /> Operator and availability
              </h2>
              {verifiedOperator ? (
                <p className="mt-2 text-[12.5px] leading-relaxed text-ink-700">
                  Operated by <strong>{pkg.operatorName}</strong>
                  {pkg.operatorContact ? ` · ${pkg.operatorContact}` : ""}. Verification was performed by our editorial
                  team; it is not a guarantee of service quality.
                </p>
              ) : (
                <p className="mt-2 text-[12.5px] leading-relaxed text-ink-600">
                  This is a planning template, not a product for sale. We have not attached a verified operator, so we do
                  not present one. Send an inquiry and we will explain how to arrange the trip with a licensed provider, or
                  use the directory to contact operators directly.
                </p>
              )}
              <div className="mt-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-400">Verified departure dates</p>
                {dates.length ? (
                  <ul className="mt-1.5 flex flex-wrap gap-1.5">
                    {dates.map((date) => (
                      <li key={date} className="rounded-full bg-forest-50 px-2.5 py-1 text-[11px] font-medium text-forest-700">
                        {date}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-[12px] text-ink-500">
                    None published. We do not invent availability — ask the operator for current dates.
                  </p>
                )}
              </div>
            </section>

            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href={`/trip-planner?destination=${row.destinationSlug ?? ""}`}
                className="btn btn-primary px-5 text-[13px]"
              >
                <Sparkles className="size-4" aria-hidden /> Rebuild this with my dates
              </Link>
              <Link href={`/budget-calculator?destination=${row.destinationSlug ?? ""}`} className="btn btn-ghost px-4 text-[13px]">
                <Wallet className="size-4" aria-hidden /> Check the budget
              </Link>
              <a href="#inquire" className="btn btn-ghost px-4 text-[13px]">
                Inquire about this trip
              </a>
            </div>

            <p className="mt-4 flex items-start gap-2 rounded-xl border border-sunset-100 bg-sunset-100/40 px-3.5 py-3 text-[11.5px] leading-relaxed text-ink-700">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-sunset-600" aria-hidden />
              Estimates only. Nothing on this page is a quotation, and no booking or payment can be made here.
            </p>
          </div>
        </div>

        <aside id="inquire" className="scroll-mt-24">
          <div className="card p-5">
            <p className="eyebrow mb-2">Ask about this template</p>
            <h2 className="text-[16px] font-bold text-forest-900">Send an inquiry</h2>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-500">
              Tell us your dates and group size. We reply within three working days. Do not send payment details.
            </p>
            <div className="mt-4">
              <InquiryForm type="package" subject={`Inquiry: ${pkg.title}`} compact />
            </div>
          </div>

          {others.length ? (
            <div className="mt-5">
              <p className="eyebrow mb-2">Other templates</p>
              <div className="space-y-4">
                {others.map((item) => (
                  <PackageCard key={item.pkg.id} pkg={item.pkg} destinationName={item.destinationName} />
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>

      <div className="page mt-10 pb-16">
        <Link href="/packages" className="text-[12.5px] font-semibold text-river-700 hover:underline">
          <ArrowRight className="mr-1 inline size-3.5 rotate-180" aria-hidden /> All trip templates
        </Link>
      </div>
    </main>
  );
}
