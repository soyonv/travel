import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, Database, HeartHandshake, Languages, Sparkles, Wallet } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { getDbOrNull } from "@/lib/db";
import { getSiteStats } from "@/lib/queries";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About us — an independent Bangladesh travel platform",
  description:
    "Why Discover Bangladesh AI exists, how the destination data and AI are built, what we will not do, and how to correct us.",
  alternates: { canonical: "/about" },
  openGraph: { title: "About Discover Bangladesh AI", url: absoluteUrl("/about") },
};

const PRINCIPLES = [
  {
    icon: Database,
    title: "Data before decoration",
    body: "Destinations, districts and attractions live in a database with sources and verification states — not hard-coded into a landing page.",
  },
  {
    icon: Sparkles,
    title: "AI that shows its limits",
    body: "BanglaVoyage AI is grounded in our records, validated before display, and forbidden from claiming a booking exists.",
  },
  {
    icon: Wallet,
    title: "Estimates called estimates",
    body: "Every cost comes from a transparent model with stated assumptions. We do not dress a guess as a live price.",
  },
  {
    icon: Languages,
    title: "Bilingual by default",
    body: "Bangla and English share the same layout, the same data and the same AI. Neither is an afterthought.",
  },
  {
    icon: HeartHandshake,
    title: "Communities first",
    body: "No permit-skipping itineraries, no wildlife baiting, no photography without consent. The guide should leave a place better.",
  },
  {
    icon: Compass,
    title: "Built to be checked",
    body: "Corrections, source lists and an admin audit log exist so trust can be maintained, not just asserted.",
  },
];

export default async function AboutPage() {
  const db = await getDbOrNull();
  const stats = db ? await getSiteStats(db).catch(() => null) : null;

  return (
    <main id="main">
      <PageHeader
        eyebrow="Why this exists"
        title="A guide to Bangladesh that admits what it does not know."
        description="Most travel pages are written to sell something. This one is built to help you decide — with sources, estimates and a bilingual AI that can say “I do not have that.”"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
      >
        <div className="flex flex-wrap gap-2">
          <Link href="/destinations" className="btn btn-primary px-4 py-2 text-[12.5px]">
            Start with destinations <ArrowRight className="size-3.5" aria-hidden />
          </Link>
          <Link href="/editorial-policy" className="btn btn-ghost px-4 py-2 text-[12.5px]">
            How we work
          </Link>
        </div>
      </PageHeader>

      <div className="page py-9">
        {stats ? (
          <dl className="grid grid-cols-2 gap-6 border-b border-ink-900/8 pb-7 sm:grid-cols-4">
            {[
              { value: stats.districts, label: "Districts covered" },
              { value: stats.destinations, label: "In-depth destinations" },
              { value: stats.attractions, label: "Attractions in the index" },
              { value: stats.articles, label: "Guides and stories" },
            ].map((item) => (
              <div key={item.label}>
                <dt className="sr-only">{item.label}</dt>
                <dd>
                  <p className="display text-[2.2rem] leading-none text-forest-900">{item.value}</p>
                  <p className="mt-1.5 text-[10.5px] font-semibold uppercase tracking-[0.13em] text-ink-400">{item.label}</p>
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        <section className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="display text-[1.7rem] text-forest-900">What this is</h2>
            <div className="prose-editorial mt-3 text-[14.5px]">
              <p>
                Discover Bangladesh AI is an independent, bilingual travel platform: destination guides, a page for all 64
                districts, costed trip templates, a budget model, an interactive map and an AI travel agent. The public
                guides require no account and no payment.
              </p>
              <p>
                It began from a simple frustration: searching for a Bangladesh trip returns either glossy tourism copy or
                out-of-date blog posts, with no way to tell which is which. So the records here carry sources and
                verification labels, and every cost is marked as an estimate.
              </p>
              <p>
                The AI is deliberately narrow. It can draft an itinerary from our destination data, compare places and explain
                access caveats. It cannot book, pay for, or confirm anything — and it is instructed to say when it does not
                know.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-forest-100 bg-forest-50 p-5">
            <h2 className="text-[15px] font-bold text-forest-900">What this is not</h2>
            <ul className="mt-2 space-y-2 text-[12px] leading-relaxed text-forest-800">
              <li>· A tour operator or booking agency — we take no payments.</li>
              <li>· An official government or tourism-board site.</li>
              <li>· A review platform — we do not publish invented ratings.</li>
              <li>· A substitute for a licensed guide in protected areas.</li>
              <li>· A source of live weather, fares or availability.</li>
            </ul>
            <p className="mt-4 text-[11px] leading-relaxed text-forest-700">
              Links to the Bangladesh Tourism Board, Forest Department and other authorities are provided so you can verify
              what matters close to departure.
            </p>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="display text-[1.7rem] text-forest-900">Principles</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PRINCIPLES.map((principle) => (
              <div key={principle.title} className="card p-4">
                <principle.icon className="size-4 text-forest-600" aria-hidden />
                <p className="mt-2 text-[13px] font-bold text-forest-900">{principle.title}</p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-ink-500">{principle.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-5 lg:grid-cols-2">
          <div className="card p-5">
            <h2 className="text-[15px] font-bold text-forest-900">How the content is made</h2>
            <ol className="mt-2 space-y-2 text-[12px] leading-relaxed text-ink-600">
              <li>1. Public and official sources are read and recorded.</li>
              <li>2. A destination or district record is written with a source list.</li>
              <li>3. A second pass checks fees, access, permits and seasonal risks.</li>
              <li>4. Anything unverified is labelled as seed content, not presented as fact.</li>
              <li>5. Corrections are logged and the updated date changes.</li>
            </ol>
            <Link href="/editorial-policy" className="mt-3 inline-block text-[11.5px] font-semibold text-river-700 underline">
              Read the full editorial policy
            </Link>
          </div>
          <div className="card p-5">
            <h2 className="text-[15px] font-bold text-forest-900">Who runs it</h2>
            <p className="mt-2 text-[12.5px] leading-relaxed text-ink-600">
              The platform is run by a small editorial and engineering team. We do not publish invented author biographies or
              stock-photo “experts”. Where a piece has a named author, that person wrote it; otherwise it is the editorial
              team.
            </p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-ink-600">
              If you live in a district we cover badly, we would rather hear from you than guess. Corrections and local
              knowledge are genuinely welcome.
            </p>
            <Link href="/contact" className="btn btn-primary mt-3 px-4 py-2 text-[12px]">
              Send a correction
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
