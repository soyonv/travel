import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Handshake, ListChecks, XCircle } from "lucide-react";
import { InquiryForm } from "@/components/inquiry-form";
import { PageHeader } from "@/components/page-header";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Partner with us",
  description:
    "Submit a guesthouse, tour operator, guide or transport service for editorial review. Free listing, verification requirements and what we will not accept.",
  alternates: { canonical: "/partners" },
  openGraph: { title: "Partner with Discover Bangladesh AI", url: absoluteUrl("/partners") },
};

export default function PartnersPage() {
  return (
    <main id="main">
      <PageHeader
        eyebrow="Work with us"
        title="Partner with us"
        description="We list businesses we can verify and describe honestly. Inclusion is editorial and free; it is not advertising, and it cannot be bought."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Partners" }]}
      >
        <Link href="/packages#directory" className="btn btn-ghost px-4 py-2 text-[12.5px]">
          See the current directory
        </Link>
      </PageHeader>

      <div className="page grid gap-6 py-9 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <section className="card p-5">
            <p className="flex items-center gap-1.5 text-[13px] font-bold text-forest-900">
              <ListChecks className="size-4 text-forest-600" aria-hidden /> What to send
            </p>
            <ul className="mt-2 space-y-1.5 text-[11.5px] leading-relaxed text-ink-600">
              <li>· Business name, address and district</li>
              <li>· Phone number and website or Facebook page</li>
              <li>· Tourism registration or trade licence details</li>
              <li>· What you actually provide, with typical rates</li>
              <li>· Languages spoken and accessibility notes</li>
            </ul>
          </section>

          <section className="card p-5">
            <p className="flex items-center gap-1.5 text-[13px] font-bold text-forest-900">
              <BadgeCheck className="size-4 text-forest-600" aria-hidden /> How verification works
            </p>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-600">
              An editor checks that the business exists, that the contact details answer, and that the description matches what
              is offered. Verified entries are marked with a date. Verification is not a quality rating or a guarantee, and we
              re-check periodically.
            </p>
          </section>

          <section className="card p-5">
            <p className="flex items-center gap-1.5 text-[13px] font-bold text-forest-900">
              <XCircle className="size-4 text-sunset-600" aria-hidden /> What we will not accept
            </p>
            <ul className="mt-2 space-y-1.5 text-[11.5px] leading-relaxed text-ink-600">
              <li>· Payment for placement, ranking or a positive review</li>
              <li>· Offers that skip permits or protected-area rules</li>
              <li>· Wildlife shows or animal rides</li>
              <li>· Fake reviews, invented awards or unverifiable claims</li>
            </ul>
          </section>

          <div className="rounded-xl border border-forest-100 bg-forest-50 p-4 text-[11px] leading-relaxed text-forest-700">
            <p className="flex items-center gap-1.5 font-bold">
              <Handshake className="size-3.5" aria-hidden /> Affiliate and sponsorship policy
            </p>
            <p className="mt-1">
              No commercial links are active in this build. If that changes, affected pages will disclose it. See the{" "}
              <Link href="/affiliate-disclosure" className="font-semibold underline">
                affiliate disclosure
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="card p-5 sm:p-6">
          <h2 className="text-[16px] font-bold text-forest-900">Submit a listing or partnership</h2>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-500">
            One message per business, please. We reply within three working days; verification may take longer.
          </p>
          <div className="mt-4">
            <InquiryForm type="partnership" subject="Directory listing / partnership request" />
          </div>
        </div>
      </div>
    </main>
  );
}
