import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Terms of service",
  description:
    "The terms that apply to Discover Bangladesh AI: planning information only, no bookings, account rules, acceptable use and liability.",
  alternates: { canonical: "/terms" },
  openGraph: { title: "Terms of service", url: absoluteUrl("/terms") },
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="The agreement"
      title="Terms of service"
      description="Short version: we help you plan, we do not sell travel, and every figure is an estimate unless a source says otherwise."
      updated="24 October 2026"
      sections={[
        {
          id: "service",
          heading: "What this service is",
          body: (
            <>
              <p>
                Discover Bangladesh AI publishes editorial travel information about Bangladesh, provides planning tools and
                offers an AI assistant that drafts suggestions from our destination records. Access to public guides does not
                require an account.
              </p>
              <p>
                This is an independent editorial project. It is not a tour operator, travel agency, airline, hotel or
                government body, and it is not affiliated with the Bangladesh Tourism Board or any listed business.
              </p>
            </>
          ),
        },
        {
          id: "no-booking",
          heading: "No bookings, payments or confirmations",
          body: (
            <>
              <p>
                Nothing on this site is an offer capable of acceptance. We do not take payments, hold reservations, issue
                tickets or confirm availability. Any inquiry form sends a message to the editorial team; it does not create a
                booking with any provider.
              </p>
              <p>
                Prices, durations, group sizes and itineraries are planning estimates built from our own model. They can be
                wrong and they change quickly. Confirm with the provider before paying anyone.
              </p>
            </>
          ),
        },
        {
          id: "accounts",
          heading: "Accounts",
          body: (
            <>
              <p>
                You must give accurate details, keep your password confidential and be at least 16. Do not share an account.
                You are responsible for activity under your account.
              </p>
              <p>
                You may delete your account at any time from the account page. We may suspend or remove accounts that abuse
                the service, attempt to break its security, scrape it at scale, or misuse the AI tools.
              </p>
            </>
          ),
        },
        {
          id: "use",
          heading: "Acceptable use",
          body: (
            <>
              <ul>
                <li>Do not use the service to break the law or to plan harm to people, wildlife or protected areas.</li>
                <li>Do not attempt to access other users&apos; data, probe the admin area, or bypass rate limits.</li>
                <li>Do not submit malicious code, spam, or content that infringes someone else&apos;s rights.</li>
                <li>Do not present AI output as verified fact, or resell it as a booking confirmation.</li>
                <li>Respect the licences of map tiles, images and linked third-party content.</li>
              </ul>
            </>
          ),
        },
        {
          id: "content",
          heading: "Our content and yours",
          body: (
            <>
              <p>
                Editorial text, design and code are protected by copyright and, where applicable, open-source licences noted
                in the repository. Photographs remain the property of their credited authors and are used under the licences
                shown on each file page.
              </p>
              <p>
                You keep ownership of the itineraries and messages you create. You grant us the limited permission needed to
                store and display them to you, and to anyone you deliberately share a trip link with.
              </p>
            </>
          ),
        },
        {
          id: "ai",
          heading: "AI output is not advice",
          body: (
            <>
              <p>
                BanglaVoyage AI can be wrong, incomplete or out of date. It cannot book anything and does not know live
                availability, prices, weather or road conditions. Do not rely on it for medical, legal, immigration or safety
                decisions. The same applies to estimates from the budget calculator.
              </p>
              <p>
                Where the AI is unavailable or its output fails validation, the planner returns a data-based plan and labels
                it as such. We would rather degrade honestly than invent an answer.
              </p>
            </>
          ),
        },
        {
          id: "third-party",
          heading: "Third-party links and services",
          body: (
            <p>
              We link to official authorities, map providers and occasionally external booking pages. Those sites have their
              own terms and privacy practices. A link is not an endorsement, and we are not responsible for what happens after
              you leave this site.
            </p>
          ),
        },
        {
          id: "liability",
          heading: "Disclaimers and liability",
          body: (
            <p>
              The service is provided “as is” and “as available”. To the extent permitted by law, we exclude implied warranties
              and are not liable for losses arising from reliance on estimates, AI output, third-party services, travel
              disruption, or data loss beyond our reasonable control. Nothing in these terms limits liability that cannot be
              limited by law, including for fraud or death caused by negligence.
            </p>
          ),
        },
        {
          id: "law",
          heading: "Governing law and changes",
          body: (
            <>
              <p>
                These terms are governed by the laws of Bangladesh, and the courts of Dhaka have jurisdiction, without
                affecting mandatory consumer protections where you live.
              </p>
              <p>
                We may update these terms; the date above changes when we do. Continued use after a material change means you
                accept the new version. Questions? Use the <Link href="/contact">contact form</Link>.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
