import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Languages, MapPin, Route, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { ChatExperience } from "@/components/ai/chat-experience";
import { PageHeader } from "@/components/page-header";
import { getBindings } from "@/lib/db";
import { isAiConfigured } from "@/lib/ai";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "BanglaVoyage AI — a bilingual Bangladesh travel agent",
  description:
    "Ask a grounded AI travel agent about Bangladesh in Bangla or English: itineraries, budgets, transport, seasons, permits and alternatives.",
  alternates: { canonical: "/ai-travel-agent" },
  openGraph: { title: "BanglaVoyage AI", url: absoluteUrl("/ai-travel-agent") },
};

const CAPABILITIES = [
  { icon: MapPin, title: "Recommend", copy: "Destinations by interest, budget, season and travel time." },
  { icon: Route, title: "Plan", copy: "Day-by-day itineraries with transport and meal breaks." },
  { icon: Wallet, title: "Cost", copy: "Rough BDT estimates, labelled as estimates, never as quotes." },
  { icon: Languages, title: "Translate", copy: "Ask in Bangla or English; it replies in the language you use." },
];

export default async function AiTravelAgentPage() {
  const bindings = await getBindings();
  const configured = isAiConfigured(bindings);

  return (
    <main id="main">
      <PageHeader
        eyebrow="Ask, compare, adjust"
        title="BanglaVoyage AI"
        description="A travel agent with one job: help you decide, using this site's destination records. It will not invent bookings, operators or fares — and it says so when it does not know."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "AI travel agent" }]}
      >
        <div className="flex flex-wrap gap-2">
          <Link href="/trip-planner" className="btn btn-primary px-4 py-2 text-[12.5px]">
            <Sparkles className="size-3.5" aria-hidden /> Structured itinerary builder
          </Link>
          <Link href="/destinations" className="btn btn-ghost px-4 py-2 text-[12.5px]">
            Browse destinations
          </Link>
        </div>
      </PageHeader>

      <div className="page grid gap-5 py-8 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-ink-900/8 bg-forest-50/60 px-4 py-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sunset-600">BanglaVoyage AI</p>
              <p className="text-[13px] font-bold text-forest-900">
                {configured ? "Online · grounded in destination data" : "Planner available · AI key not configured"}
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold ${
                configured ? "bg-forest-100 text-forest-800" : "bg-sunset-100 text-sunset-600"
              }`}
            >
              <span className={`size-1.5 rounded-full ${configured ? "bg-forest-600" : "bg-sunset-500"}`} aria-hidden />
              {configured ? "Live" : "Limited"}
            </span>
          </div>
          <ChatExperience />
        </div>

        <aside className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {CAPABILITIES.map((capability) => (
              <div key={capability.title} className="rounded-xl border border-ink-900/8 bg-white px-3.5 py-3">
                <capability.icon className="size-4 text-forest-600" aria-hidden />
                <p className="mt-1.5 text-[12px] font-bold text-forest-900">{capability.title}</p>
                <p className="mt-0.5 text-[10.5px] leading-relaxed text-ink-500">{capability.copy}</p>
              </div>
            ))}
          </div>

          {!configured ? (
            <div className="rounded-2xl border border-sunset-100 bg-sunset-100/40 p-4">
              <p className="flex items-center gap-1.5 text-[12.5px] font-bold text-forest-900">
                <AlertTriangle className="size-3.5 text-sunset-600" aria-hidden /> AI is not configured
              </p>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-700">
                Add an <code className="rounded bg-white px-1 py-0.5">AI_API_KEY</code> secret to enable chat. Until then:
              </p>
              <ul className="mt-2 space-y-1 text-[11px] leading-relaxed text-ink-600">
                <li>· The trip planner still returns a data-based itinerary.</li>
                <li>· The budget calculator and all guides work normally.</li>
                <li>
                  · Optionally set <code className="rounded bg-white px-1 py-0.5">AI_BASE_URL</code> and{" "}
                  <code className="rounded bg-white px-1 py-0.5">AI_MODEL</code> for an OpenAI-compatible endpoint.
                </li>
              </ul>
              <p className="mt-2 text-[10.5px] leading-relaxed text-ink-500">
                The key is read server-side only and is never sent to the browser. See the README for deployment steps.
              </p>
            </div>
          ) : null}

          <div className="rounded-2xl border border-forest-100 bg-forest-50 p-4">
            <p className="flex items-center gap-1.5 text-[12.5px] font-bold text-forest-900">
              <ShieldCheck className="size-3.5" aria-hidden /> How it is grounded
            </p>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-forest-700">
              Each request includes a compact extract of the destination records, attraction notes and active advisories.
              The system prompt forbids invented fees, schedules, hotels and confirmations, ignores instructions embedded in
              that data, and asks for uncertainty to be stated plainly.
            </p>
          </div>

          <div className="rounded-2xl border border-ink-900/8 bg-white p-4">
            <p className="text-[12.5px] font-bold text-forest-900">What it cannot do</p>
            <ul className="mt-1.5 space-y-1 text-[11px] leading-relaxed text-ink-500">
              <li>· Book, reserve, pay for or confirm anything</li>
              <li>· Give live availability or exact fares</li>
              <li>· Replace a licensed guide in protected areas</li>
              <li>· Advise on visas or medical fitness — ask the relevant authority</li>
            </ul>
            <Link href="/faq" className="mt-2.5 inline-block text-[11px] font-semibold text-river-700 underline">
              Read the FAQ
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
