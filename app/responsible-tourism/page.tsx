import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Responsible tourism in Bangladesh",
  description:
    "Practical guidance for travelling respectfully in Bangladesh: protected areas, wildlife, hill communities, islands, religious sites, waste and local spending.",
  alternates: { canonical: "/responsible-tourism" },
  openGraph: { title: "Responsible tourism", url: absoluteUrl("/responsible-tourism") },
};

export default function ResponsibleTourismPage() {
  return (
    <LegalPage
      eyebrow="Travel well"
      title="Responsible tourism"
      description="Bangladesh is not a theme park. These are the practical rules that protect the places and people you are going to see."
      updated="24 October 2026"
      aside={
        <div className="card p-4">
          <p className="text-[12px] font-bold text-forest-900">Official starting points</p>
          <ul className="mt-2 space-y-1.5 text-[11px]">
            {[
              { label: "Bangladesh Tourism Board", href: "https://tourismboard.gov.bd/" },
              { label: "Forest Department", href: "https://bforest.gov.bd/" },
              { label: "Beautiful Bangladesh", href: "https://beautifulbangladesh.gov.bd/" },
              { label: "Bangladesh Meteorological Department", href: "https://bmd.gov.bd/" },
            ].map((link) => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-river-700 underline">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[10.5px] leading-relaxed text-ink-400">
            Rules change. Check the current notice before you travel, not this page.
          </p>
        </div>
      }
      sections={[
        {
          id: "protected",
          heading: "Protected areas and permits",
          body: (
            <>
              <p>
                The Sundarbans and other reserves require permits, registered guides and often a licensed vessel. The Forest
                Department closes parts of the Sundarbans to tourism during the monsoon; the exact dates and zones change.
                Never pay an operator who offers to skip the permit.
              </p>
              <p>
                Stay on marked trails at archaeological and heritage sites, and do not climb on structures. Paharpur, Bagerhat
                and Mahasthangarh are protected monuments, not picnic grounds.
              </p>
            </>
          ),
        },
        {
          id: "wildlife",
          heading: "Wildlife",
          body: (
            <p>
              Keep your distance, stay quiet on the water and never feed animals. Do not ask for tiger sightings at any cost —
              a rushed boat through a channel is dangerous for you and stressful for the forest. Avoid attractions that offer
              animal rides or performances; if you are unsure, ask where the animal came from and walk away.
            </p>
          ),
        },
        {
          id: "communities",
          heading: "Communities and consent",
          body: (
            <>
              <p>
                Ask before photographing people, especially women, children and anyone at work. A smile and a gesture is not
                consent if the person cannot easily say no. If someone asks for money for a photograph, that is their choice;
                do not photograph covertly instead.
              </p>
              <p>
                In the Chittagong Hill Tracts, many communities are indigenous and have distinct languages, customs and land
                rights. Dress modestly, ask before entering a village or a private compound, and buy directly from makers
                rather than middlemen where possible.
              </p>
            </>
          ),
        },
        {
          id: "islands",
          heading: "Islands, reefs and the coast",
          body: (
            <p>
              Saint Martin&apos;s and the coral areas are fragile. Do not take coral, shells or starfish, and use reef-safe sun
              protection. Swimming is only safe in patrolled sections; currents along Cox&apos;s Bazar and Kuakata are stronger
              than they look. During cyclone warnings, leave the coast when authorities ask, not when it becomes obvious.
            </p>
          ),
        },
        {
          id: "religion",
          heading: "Religious sites",
          body: (
            <p>
              Remove shoes where required, cover shoulders and knees, and ask before entering a space reserved for prayer.
              Do not photograph worshippers or ceremonies without permission. During Eid, Friday prayers and festivals, give
              people space and follow local instructions.
            </p>
          ),
        },
        {
          id: "waste",
          heading: "Waste, water and energy",
          body: (
            <ul>
              <li>Carry your rubbish out, including bottles and wrappers. Hill and island waste systems are limited.</li>
              <li>Refuse single-use plastic bags; a cloth bag weighs nothing.</li>
              <li>Refill water where it is filtered and safe, or use purification rather than buying bottles all day.</li>
              <li>Turn off the air conditioner when you leave the room; ask before taking long boat trips for short visits.</li>
            </ul>
          ),
        },
        {
          id: "money",
          heading: "Spend locally",
          body: (
            <p>
              Eat at local restaurants, use local guides and drivers, and buy crafts from the person who made them. Agree the
              price before the service, and pay in cash where card machines are rare. A fair price is not the lowest possible
              price.
            </p>
          ),
        },
        {
          id: "safety",
          heading: "Safety and official advice",
          body: (
            <>
              <p>
                Check weather and road conditions before long drives, avoid night travel on hill roads, and never board an
                overloaded launch. Keep a copy of your passport and emergency contacts, and tell someone your plan when going
                remote.
              </p>
              <p>
                For current restrictions, read the{" "}
                <Link href="/faq">FAQ</Link>, the advisory cards on destination pages, and the official sources in the sidebar.
                If a place is closed, choose an alternative — our{" "}
                <Link href="/ai-travel-agent">AI agent</Link> can suggest one from our data.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
