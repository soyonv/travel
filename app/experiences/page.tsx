import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { DestinationCard } from "@/components/cards";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { getDbOrNull } from "@/lib/db";
import { getDestinations, getExperiences } from "@/lib/queries";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Travel by experience — beaches, hills, rivers and heritage",
  description:
    "Thirteen ways to travel Bangladesh: beach escapes, hill adventures, river journeys, wildlife, heritage, food, village stays, photography, eco-tourism and more.",
  alternates: { canonical: "/experiences" },
  openGraph: { title: "Travel by experience", url: absoluteUrl("/experiences") },
};

const EXPERIENCE_CATEGORIES: Record<string, string[]> = {
  "beach-escapes": ["Beaches & Islands"],
  "hill-adventures": ["Hills & Adventure"],
  "river-journeys": ["Nature & Waterfalls", "Forest & Wildlife"],
  "forest-wildlife": ["Forest & Wildlife"],
  "historical-exploration": ["History & Heritage"],
  "religious-cultural": ["History & Heritage"],
  "food-tourism": ["History & Heritage"],
  "village-experiences": ["Nature & Waterfalls", "Beaches & Islands"],
  "photography-tours": ["Beaches & Islands", "Hills & Adventure", "Nature & Waterfalls"],
  "eco-tourism": ["Forest & Wildlife", "Nature & Waterfalls"],
  "family-holidays": ["Beaches & Islands", "History & Heritage"],
  "budget-travel": ["Nature & Waterfalls", "History & Heritage"],
  "luxury-travel": ["Beaches & Islands", "Hills & Adventure"],
};

const EXPERIENCE_NOTES: Record<string, string> = {
  "beach-escapes": "Swim only where lifeguards are present. The tide along Cox's Bazar and Kuakata is stronger than it looks.",
  "hill-adventures": "Hill roads are slow and landslide-prone in the monsoon. Some areas need permits or guided access.",
  "river-journeys": "Launch and boat schedules change with the water. Never board an overloaded vessel.",
  "forest-wildlife": "The Sundarbans requires a Forest Department permit and a licensed guide. Keep noise down and stay with the group.",
  "historical-exploration": "Many sites are active places of worship or protected monuments. Dress modestly and follow site rules.",
  "religious-cultural": "Ask before photographing worshippers or ceremonies. Remove shoes where required.",
  "food-tourism": "Street food is best at busy stalls with high turnover. Carry water and be cautious with ice.",
  "village-experiences": "Arrange homestays through a known contact, agree the rate first and respect private land.",
  "photography-tours": "Golden hour here is short. Ask permission before photographing people, especially at work.",
  "eco-tourism": "Carry your waste out, avoid single-use plastic and do not feed or approach wildlife.",
  "family-holidays": "Long drives are the main challenge. Plan shorter legs, carry snacks and keep a rest day.",
  "budget-travel": "Trains and coaches are the cheapest intercity options. Book early around Eid and winter weekends.",
  "luxury-travel": "The best rooms are limited outside Dhaka and Cox's Bazar — book well ahead for holidays.",
};

export default async function ExperiencesPage() {
  const db = await getDbOrNull();
  if (!db) {
    return (
      <main id="main">
        <PageHeader eyebrow="Experiences" title="Choose a way to travel" breadcrumbs={[{ label: "Home", href: "/" }, { label: "Experiences" }]} />
        <div className="page py-10">
          <EmptyState title="The database is not connected" description="Apply the migration and seed data, then reload." />
        </div>
      </main>
    );
  }

  const [experiences, destinations] = await Promise.all([getExperiences(db), getDestinations(db, { limit: 60 })]);

  return (
    <main id="main">
      <PageHeader
        eyebrow="Thirteen ways in"
        title="Travel by experience"
        description="Pick the kind of trip you want, not just a place. Each section links to destinations that genuinely suit it, with notes on access and responsibility."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Experiences" }]}
      >
        <div className="flex flex-wrap gap-1.5">
          {experiences.map((experience) => (
            <a key={experience.slug} href={`#${experience.slug}`} className="chip text-[11.5px]">
              {experience.nameEn}
            </a>
          ))}
        </div>
      </PageHeader>

      <div className="page space-y-14 py-10">
        {experiences.map((experience, index) => {
          const categories = EXPERIENCE_CATEGORIES[experience.slug] ?? [];
          const matches = destinations.filter((destination) => categories.includes(destination.category)).slice(0, 3);
          const reverse = index % 2 === 1;
          return (
            <section key={experience.slug} id={experience.slug} className="scroll-mt-24" aria-labelledby={`${experience.slug}-title`}>
              <div className={`grid items-center gap-7 lg:grid-cols-2 ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
                <Reveal>
                  <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-forest-100">
                    {experience.image ? (
                      <Image
                        src={experience.image}
                        alt={experience.nameEn}
                        fill
                        sizes="(max-width:1024px) 92vw, 45vw"
                        className="object-cover"
                        loading={index > 1 ? "lazy" : "eager"}
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-forest-950/40 to-transparent" />
                    <span className="absolute left-4 top-4 rounded-full bg-ivory-50/95 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-forest-800">
                      {String(index + 1).padStart(2, "0")} · Experience
                    </span>
                  </div>
                </Reveal>
                <Reveal delay={0.08}>
                  <h2 id={`${experience.slug}-title`} className="display text-[clamp(1.7rem,3.2vw,2.5rem)] text-forest-900">
                    {experience.nameEn}
                  </h2>
                  {experience.nameBn ? (
                    <p className="mt-1 text-[13px] text-ink-400" lang="bn">
                      {experience.nameBn}
                    </p>
                  ) : null}
                  <p className="mt-3 text-[15px] leading-relaxed text-ink-700">{experience.summary}</p>
                  {EXPERIENCE_NOTES[experience.slug] ? (
                    <p className="mt-3 rounded-xl border border-forest-100 bg-forest-50 px-3.5 py-2.5 text-[11.5px] leading-relaxed text-forest-700">
                      {EXPERIENCE_NOTES[experience.slug]}
                    </p>
                  ) : null}
                  {matches.length ? (
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      {matches.map((destination) => (
                        <DestinationCard key={destination.slug} destination={destination} sizes="(max-width:640px) 90vw, 15vw" />
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link href={`/destinations?category=${encodeURIComponent(categories[0] ?? "")}`} className="btn btn-ghost px-4 py-2 text-[12.5px]">
                      Browse matching destinations <ArrowRight className="size-3.5" aria-hidden />
                    </Link>
                    <Link href="/trip-planner" className="btn btn-primary px-4 py-2 text-[12.5px]">
                      <Sparkles className="size-3.5" aria-hidden /> Plan around this
                    </Link>
                  </div>
                </Reveal>
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
