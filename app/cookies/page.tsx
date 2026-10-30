import type { Metadata } from "next";
import Link from "next/link";
import { CookiePreferences } from "@/components/cookie-preferences";
import { LegalPage } from "@/components/legal-page";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Cookie preferences",
  description: "The two functional cookies this site uses, and how to record a preference for optional analytics or marketing.",
  alternates: { canonical: "/cookies" },
  openGraph: { title: "Cookie preferences", url: absoluteUrl("/cookies") },
};

export default function CookiesPage() {
  return (
    <LegalPage
      eyebrow="Control"
      title="Cookie preferences"
      description="Only functional cookies are set today. Optional categories exist so a future tool cannot be added without your choice."
      updated="24 October 2026"
      aside={
        <div className="card p-4">
          <p className="text-[12px] font-bold text-forest-900">Why so few cookies?</p>
          <p className="mt-1 text-[11px] leading-relaxed text-ink-500">
            The platform is server-rendered and does not require a client-side analytics stack. Fewer scripts means fewer
            things to consent to.
          </p>
          <Link href="/privacy" className="mt-3 inline-block text-[11px] font-semibold text-river-700 underline">
            Read the privacy policy
          </Link>
        </div>
      }
      sections={[
        {
          id: "preferences",
          heading: "Your preferences",
          body: <CookiePreferences />,
        },
        {
          id: "necessary",
          heading: "Strictly necessary cookies",
          body: (
            <>
              <div className="overflow-x-auto rounded-xl border border-ink-900/10">
                <table className="w-full border-collapse text-left text-[12.5px]">
                  <thead className="bg-ivory-100">
                    <tr>
                      <th scope="col" className="px-3 py-2 font-semibold">Name</th>
                      <th scope="col" className="px-3 py-2 font-semibold">Purpose</th>
                      <th scope="col" className="px-3 py-2 font-semibold">Lifetime</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-ink-900/5">
                      <td className="px-3 py-2 font-mono text-[11.5px]">db_session</td>
                      <td className="px-3 py-2">Keeps you signed in. HTTP-only and SameSite=Lax.</td>
                      <td className="px-3 py-2">30 days</td>
                    </tr>
                    <tr className="border-t border-ink-900/5">
                      <td className="px-3 py-2 font-mono text-[11.5px]">db_lang</td>
                      <td className="px-3 py-2">Remembers English or Bangla.</td>
                      <td className="px-3 py-2">1 year</td>
                    </tr>
                    <tr className="border-t border-ink-900/5">
                      <td className="px-3 py-2 font-mono text-[11.5px]">sessionStorage: db-announcement-dismissed</td>
                      <td className="px-3 py-2">Hides the notice bar after you dismiss it. Not a cookie.</td>
                      <td className="px-3 py-2">Until the tab closes</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3">
                Clearing cookies in your browser signs you out and resets the language preference. It does not delete your
                account or itineraries.
              </p>
            </>
          ),
        },
        {
          id: "third-party",
          heading: "Third-party requests",
          body: (
            <p>
              Opening the map loads tiles and attribution from OpenStreetMap, which receives your IP address as any web
              request does. We do not embed social widgets or advertising iframes. External links open on the provider&apos;s
              own site under its own policies.
            </p>
          ),
        },
      ]}
    />
  );
}
