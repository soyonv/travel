import type { Metadata } from "next";
import Link from "next/link";
import { Clock, FileQuestion, Mail, ShieldCheck } from "lucide-react";
import { InquiryForm } from "@/components/inquiry-form";
import { PageHeader } from "@/components/page-header";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact the Discover Bangladesh AI editorial team: corrections, data questions, partnerships, accessibility issues or privacy requests.",
  alternates: { canonical: "/contact" },
  openGraph: { title: "Contact", url: absoluteUrl("/contact") },
};

export default function ContactPage() {
  return (
    <main id="main">
      <PageHeader
        eyebrow="Talk to us"
        title="Contact the editorial team"
        description="Corrections, missing places, accessibility problems, privacy requests or partnership questions. We read everything; we cannot always reply quickly."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />

      <div className="page grid gap-6 py-9 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="card p-5 sm:p-6">
          <h2 className="text-[16px] font-bold text-forest-900">Send a message</h2>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-500">
            The form stores your message in our database for the editorial team. This build does not send an automated email
            confirmation, and no booking is created.
          </p>
          <div className="mt-4">
            <InquiryForm type="general" subject="Message from the contact page" />
          </div>
        </div>

        <aside className="space-y-4">
          <div className="card p-4">
            <p className="flex items-center gap-1.5 text-[12.5px] font-bold text-forest-900">
              <Clock className="size-3.5 text-forest-600" aria-hidden /> Response times
            </p>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-500">
              Corrections about safety, permits or prices are prioritised and usually reviewed within two working days. General
              messages can take up to a week.
            </p>
          </div>

          <div className="card p-4">
            <p className="flex items-center gap-1.5 text-[12.5px] font-bold text-forest-900">
              <FileQuestion className="size-3.5 text-forest-600" aria-hidden /> Good corrections include
            </p>
            <ul className="mt-1.5 space-y-1 text-[11.5px] leading-relaxed text-ink-500">
              <li>· the page URL</li>
              <li>· what is wrong, and what it should say</li>
              <li>· a source or official notice where possible</li>
              <li>· the date you checked</li>
            </ul>
          </div>

          <div className="card p-4">
            <p className="flex items-center gap-1.5 text-[12.5px] font-bold text-forest-900">
              <ShieldCheck className="size-3.5 text-forest-600" aria-hidden /> Privacy requests
            </p>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-500">
              To export or delete account data, use the{" "}
              <Link href="/account" className="font-semibold text-river-700 underline">
                account page
              </Link>
              . For anything else, choose “Data or privacy” as the subject and describe the request. Do not send passwords or
              payment details.
            </p>
          </div>

          <div className="rounded-xl border border-forest-100 bg-forest-50 p-4">
            <p className="flex items-center gap-1.5 text-[12px] font-bold text-forest-900">
              <Mail className="size-3.5" aria-hidden /> Partner or operator?
            </p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-forest-700">
              Use the{" "}
              <Link href="/partners" className="font-semibold underline">
                partner page
              </Link>{" "}
              so we receive the details we need to verify a listing.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
