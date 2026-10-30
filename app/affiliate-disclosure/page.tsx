import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Affiliate disclosure",
  description: "How commercial links would work on Discover Bangladesh AI, and why there are none in the current build.",
  alternates: { canonical: "/affiliate-disclosure" },
  openGraph: { title: "Affiliate disclosure", url: absoluteUrl("/affiliate-disclosure") },
};

export default function AffiliateDisclosurePage() {
  return (
    <LegalPage
      eyebrow="Money, plainly"
      title="Affiliate disclosure"
      description="The current build contains no affiliate links and no paid placements. This page explains the rule we will follow if that changes."
      updated="24 October 2026"
      sections={[
        {
          id: "now",
          heading: "Right now",
          body: (
            <p>
              No link on this site earns us a commission. Directory entries are free and editorial. No operator, hotel or
              booking platform has paid for a mention, a ranking, a review or an itinerary. If you book directly with a
              business you found here, we receive nothing.
            </p>
          ),
        },
        {
          id: "future",
          heading: "If we add commercial links",
          body: (
            <>
              <p>
                Some travel sites fund themselves with affiliate links. If we introduce them, we will:
              </p>
              <ul>
                <li>Label the link or the page clearly, before the click, not in the footer only.</li>
                <li>Keep editorial judgement independent — a commission will never buy a better review or a listing.</li>
                <li>Never place affiliate links in AI answers without saying so in the interface.</li>
                <li>Exclude affiliate links from safety, permit and emergency information.</li>
              </ul>
              <p>
                That change would be reflected here and on the affected pages before going live.
              </p>
            </>
          ),
        },
        {
          id: "external",
          heading: "External links in general",
          body: (
            <p>
              We link to official authorities, map data, image sources and occasionally operators&apos; own websites so you can
              verify something yourself. These are references, not endorsements. We do not control their content, prices or
              availability, and we are not responsible for transactions you make with them.
            </p>
          ),
        },
        {
          id: "contact",
          heading: "Questions",
          body: (
            <p>
              If a page looks like it contains an undisclosed commercial arrangement, tell us via the{" "}
              <Link href="/contact">contact form</Link> with the URL. We would rather fix it than argue about it.
            </p>
          ),
        },
      ]}
    />
  );
}
