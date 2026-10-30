import type { Metadata } from "next";
import Link from "next/link";
import { Info, Sparkles, Wallet } from "lucide-react";
import { BudgetCalculator } from "@/components/budget/budget-calculator";
import { PageHeader } from "@/components/page-header";
import { getDbOrNull } from "@/lib/db";
import { getDestinationBySlug } from "@/lib/queries";
import { absoluteUrl } from "@/lib/utils";
import type { TravelStyle } from "@/lib/budget";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bangladesh travel budget calculator — what a trip really costs",
  description:
    "Estimate a Bangladesh trip in taka: transport, rooms, food, local transport, tickets, guides and boats, with a contingency and a budget/standard/premium comparison.",
  alternates: { canonical: "/budget-calculator" },
  openGraph: { title: "Bangladesh travel budget calculator", url: absoluteUrl("/budget-calculator") },
};

const STYLE_VALUES: TravelStyle[] = ["budget", "standard", "premium"];

export default async function BudgetCalculatorPage({
  searchParams,
}: {
  searchParams: Promise<{ destination?: string; days?: string; travelers?: string; style?: string }>;
}) {
  const params = await searchParams;
  const db = await getDbOrNull();
  const destination = params.destination && db ? await getDestinationBySlug(db, params.destination).catch(() => null) : null;

  const days = Math.min(30, Math.max(1, Number.parseInt(params.days ?? "4", 10) || 4));
  const travelers = Math.min(20, Math.max(1, Number.parseInt(params.travelers ?? "2", 10) || 2));
  const style = STYLE_VALUES.includes(params.style as TravelStyle) ? (params.style as TravelStyle) : "standard";

  return (
    <main id="main">
      <PageHeader
        eyebrow="Do the arithmetic first"
        title="Travel budget calculator"
        description="A transparent model, not a quote. Change the days, the group and the style, and see how the total moves. Accommodation is priced per room; everything else is per person."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Budget calculator" }]}
      >
        <div className="flex flex-wrap gap-2">
          <Link href="/trip-planner" className="btn btn-primary px-4 py-2 text-[12.5px]">
            <Sparkles className="size-3.5" aria-hidden /> Turn it into an itinerary
          </Link>
          <Link href="/travel-guides/bangladesh-travel-budget" className="btn btn-ghost px-4 py-2 text-[12.5px]">
            Read the budget guide
          </Link>
        </div>
      </PageHeader>

      <div className="page py-8">
        <BudgetCalculator
          initialDays={days}
          initialTravelers={travelers}
          initialStyle={style}
          destinationName={destination?.nameEn}
        />

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="card p-5" aria-labelledby="what-is-included">
            <div className="flex items-center gap-2">
              <Info className="size-4 text-forest-600" aria-hidden />
              <h2 id="what-is-included" className="text-[15px] font-bold text-forest-900">
                What this model does and does not do
              </h2>
            </div>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-forest-700">Modelled</p>
                <ul className="mt-1.5 space-y-1.5 text-[12px] leading-relaxed text-ink-600">
                  <li>· Return intercity travel for the group</li>
                  <li>· Rooms (two sharing) for the nights</li>
                  <li>· Food, local transport and paid activities</li>
                  <li>· Optional guide and boat trip</li>
                  <li>· A 12% contingency</li>
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-sunset-600">Not modelled</p>
                <ul className="mt-1.5 space-y-1.5 text-[12px] leading-relaxed text-ink-600">
                  <li>· Exact fares for a specific date</li>
                  <li>· Peak-season and holiday surcharges</li>
                  <li>· Individual entry tickets</li>
                  <li>· Travel insurance or visas</li>
                  <li>· Shopping and gifts</li>
                </ul>
              </div>
            </div>
            <p className="mt-4 rounded-xl bg-ivory-100/70 px-3.5 py-2.5 text-[11px] leading-relaxed text-ink-500">
              Figures are illustrative planning ranges compiled from typical 2025–2026 prices. They are not verified live
              rates. If a hotel or operator gives you a price, use theirs.
            </p>
          </section>

          <section className="rounded-2xl border border-forest-100 bg-forest-50 p-5" aria-labelledby="ways-to-save">
            <div className="flex items-center gap-2">
              <Wallet className="size-4 text-forest-600" aria-hidden />
              <h2 id="ways-to-save" className="text-[15px] font-bold text-forest-900">
                Four ways to cut the total
              </h2>
            </div>
            <ol className="mt-3 space-y-2.5">
              {[
                "Take the train instead of flying — the biggest single saving on most routes.",
                "Travel Sunday to Wednesday; weekend and holiday room rates are higher.",
                "Share a room rather than booking singles; the room rate is charged once.",
                "Eat where people work — a busy local restaurant is cheaper and usually fresher.",
              ].map((tip, index) => (
                <li key={tip} className="flex gap-2 text-[12px] leading-relaxed text-forest-800">
                  <span className="grid size-4.5 shrink-0 place-items-center rounded-full bg-forest-800 text-[9.5px] font-bold text-ivory-50">
                    {index + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ol>
            <Link href="/ai-travel-agent" className="btn btn-primary mt-4 w-full px-4 py-2 text-[12.5px]">
              Ask the AI to fit a budget
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
