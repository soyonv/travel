import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Editorial policy",
  description:
    "How Discover Bangladesh AI sources, verifies, labels and corrects travel information — including what we do when we cannot verify something.",
  alternates: { canonical: "/editorial-policy" },
  openGraph: { title: "Editorial policy", url: absoluteUrl("/editorial-policy") },
};

export default function EditorialPolicyPage() {
  return (
    <LegalPage
      eyebrow="How we work"
      title="Editorial policy"
      description="A travel guide is only useful if it is honest about what it knows. These are the rules the team works to."
      updated="24 October 2026"
      sections={[
        {
          id: "sourcing",
          heading: "Sourcing",
          body: (
            <>
              <p>
                We start from official and primary sources wherever they exist: the Bangladesh Tourism Board, Beautiful
                Bangladesh, the Forest Department, the Bangladesh Meteorological Department, Bangladesh Railway, district
                administration pages and UNESCO documentation. For practical detail we also read reputable reporting and
                first-hand accounts, and we say which is which.
              </p>
              <p>
                Every destination and district record has a sources field. If it is empty, the page is labelled as seed content
                and treated as a starting point, not a verified guide.
              </p>
            </>
          ),
        },
        {
          id: "labels",
          heading: "How we label uncertainty",
          body: (
            <>
              <ul>
                <li>
                  <strong>Verified</strong> — checked against an official source, with the date recorded.
                </li>
                <li>
                  <strong>Seed / editorial</strong> — written from public sources but not recently re-checked.
                </li>
                <li>
                  <strong>Estimate</strong> — produced by our cost model, never a quotation or availability check.
                </li>
                <li>
                  <strong>Directory entry</strong> — a business we can point to a source for; not a booking partner, and
                  rates are unverified unless stated.
                </li>
              </ul>
              <p>
                We do not present a hotel, operator, review score or departure date as real unless someone has confirmed it.
                Where we cannot confirm, the page says so.
              </p>
            </>
          ),
        },
        {
          id: "ai",
          heading: "AI and automation",
          body: (
            <>
              <p>
                BanglaVoyage AI is a drafting and question-answering tool, grounded in a compact extract of our destination
                records and advisories. It is instructed not to invent fees, schedules, operators or confirmations, and its
                structured plans are validated before display. If validation fails, we show a deterministic data-based plan
                and label it.
              </p>
              <p>
                No article is published solely because a model produced it. A person reviews the record, the sources and the
                claims before it goes live.
              </p>
            </>
          ),
        },
        {
          id: "independence",
          heading: "Independence and funding",
          body: (
            <p>
              We do not accept payment for a positive review, a ranking position, or inclusion in an itinerary. Directory
              inclusion is editorial and free. If the project ever runs affiliate links or sponsored placements, each affected
              page will disclose it, and the{" "}
              <Link href="/affiliate-disclosure">affiliate disclosure</Link> will be updated before the change goes live.
            </p>
          ),
        },
        {
          id: "images",
          heading: "Images and attribution",
          body: (
            <p>
              Photographs are credited with the author and licence, linked to the original file page. We use openly licensed
              images and do not strip attribution. If you are a rights holder and believe an image is misattributed, contact us
              with the file page and we will correct or remove it promptly.
            </p>
          ),
        },
        {
          id: "corrections",
          heading: "Corrections",
          body: (
            <>
              <p>
                Send corrections through the <Link href="/contact">contact form</Link> with the page URL and, where possible,
                a source. We prioritise anything that could cause someone to waste money, break a permit rule, or put
                themselves in danger.
              </p>
              <p>
                Substantive corrections change the page&apos;s updated date. We do not quietly rewrite a claim to hide an
                error; if the change matters, the page says what changed.
              </p>
            </>
          ),
        },
        {
          id: "boundaries",
          heading: "What we will not publish",
          body: (
            <ul>
              <li>Encouragement to enter protected areas without permits or guides.</li>
              <li>Locations of sensitive wildlife sites or instructions that disturb animals.</li>
              <li>Invented reviews, testimonials, operator identities or availability.</li>
              <li>Content that disrespects local communities, indigenous cultures or religious practice.</li>
              <li>Medical, legal or immigration advice presented as fact.</li>
            </ul>
          ),
        },
      ]}
    />
  );
}
