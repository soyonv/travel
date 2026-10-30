import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Compass,
  ExternalLink,
  MapPin,
  ShieldCheck,
  Sparkles,
  Utensils,
} from "lucide-react";
import { Hero } from "@/components/home/hero";
import { PlannerWidget } from "@/components/home/planner-widget";
import { SeasonGuide } from "@/components/home/season-guide";
import { ArticleCard, DestinationCard, ExperienceTile, PackageCard } from "@/components/cards";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/reveal";
import { Badge, SectionHeading, SetupRequired } from "@/components/ui/primitives";
import { NewsletterForm } from "@/components/site/newsletter-form";
import { getDbOrNull } from "@/lib/db";
import {
  getAlerts,
  getArticles,
  getDestinationOptions,
  getDestinations,
  getExperiences,
  getFeaturedDestinations,
  getPackages,
  getSiteStats,
} from "@/lib/queries";
import { getLang } from "@/lib/lang-server";
import { t } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Discover Bangladesh AI — Every Journey Tells a Story",
  description:
    "Plan a Bangladesh trip with destination guides, all 64 districts, honest budgets, an interactive map and a bilingual AI travel agent. Cox's Bazar, Sundarbans, Sylhet, Sajek and more.",
  alternates: { canonical: "/", languages: { "en-BD": "/", "bn-BD": "/?lang=bn" } },
};

const AI_CAPABILITIES = [
  "Recommend destinations by interest, budget, season and travel time",
  "Draft multi-day itineraries with transport and meal breaks",
  "Compare two places side by side, including access restrictions",
  "Estimate costs and explain what is an estimate",
  "Answer in Bangla or English and switch when you do",
];

export default async function HomePage() {
  const db = await getDbOrNull();
  if (!db) return <main id="main"><SetupRequired feature="The homepage" /></main>;

  const lang = await getLang();
  const [featured, experiencesList, packageRows, articleRows, stats, alerts, destinationsForPicker] = await Promise.all([
    getFeaturedDestinations(db, 12),
    getExperiences(db),
    getPackages(db, { limit: 3 }),
    getArticles(db, { limit: 3 }),
    getSiteStats(db),
    getAlerts(db),
    getDestinationOptions(db),
  ]);

  const slides = featured.slice(0, 5).map((destination) => ({
    slug: destination.slug,
    nameEn: destination.nameEn,
    category: destination.category,
    image: destination.heroImage ?? "",
    credit: destination.imageCredit,
    creditUrl: destination.imageCreditUrl,
  }));

  const districtsTeaser = [
    { slug: "dhaka", nameEn: "Dhaka", nameBn: "ঢাকা", division: "Dhaka", tagline: "Mughal lanes and street food" },
    { slug: "sylhet", nameEn: "Sylhet", nameBn: "সিলেট", division: "Sylhet", tagline: "Tea gardens and shrines" },
    { slug: "khulna", nameEn: "Khulna", nameBn: "খুলনা", division: "Khulna", tagline: "Gateway to the Sundarbans" },
    { slug: "bandarban", nameEn: "Bandarban", nameBn: "বান্দরবান", division: "Chattogram", tagline: "Highest hills in the country" },
    { slug: "patuakhali", nameEn: "Patuakhali", nameBn: "পটুয়াখালী", division: "Barishal", tagline: "Kuakata and Fatrar Char" },
    { slug: "naogaon", nameEn: "Naogaon", nameBn: "নওগাঁ", division: "Rajshahi", tagline: "Paharpur's Buddhist vihara" },
    { slug: "sunamganj", nameEn: "Sunamganj", nameBn: "সুনামগঞ্জ", division: "Sylhet", tagline: "Tanguar Haor country" },
    { slug: "rangpur", nameEn: "Rangpur", nameBn: "রংপুর", division: "Rangpur", tagline: "Tajhat Rajbari" },
  ].map((district) => ({ ...district, image: null }));

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${absoluteUrl("/")}#website`,
        url: absoluteUrl("/"),
        name: "Discover Bangladesh AI",
        description:
          "AI-assisted travel discovery and trip planning for Bangladesh, with guides to all 64 districts.",
        inLanguage: ["en", "bn"],
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${absoluteUrl("/search")}?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${absoluteUrl("/")}#organization`,
        name: "Discover Bangladesh AI",
        url: absoluteUrl("/"),
        areaServed: "BD",
      },
    ],
  };

  return (
    <main id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <Hero slides={slides.filter((slide) => slide.image)} />

      <section className="page" aria-labelledby="planner-heading">
        <h2 id="planner-heading" className="sr-only">
          AI trip planner
        </h2>
        <Reveal>
          <PlannerWidget destinations={destinationsForPicker.slice(0, 12)} />
        </Reveal>
      </section>

      <section className="page mt-14" aria-label="Platform facts">
        <div className="grid grid-cols-2 gap-6 border-y border-ink-900/8 py-7 sm:grid-cols-4">
          {[
            { value: String(stats.districts), label: "Districts covered" },
            { value: String(stats.destinations), label: "In-depth destinations" },
            { value: String(stats.attractions), label: "Attractions mapped" },
            { value: String(stats.articles), label: "Guides and stories" },
          ].map((item) => (
            <div key={item.label}>
              <p className="display text-[2.1rem] leading-none text-forest-900">{item.value}</p>
              <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="page py-16" aria-labelledby="featured-heading">
        <SectionHeading
          eyebrow="Where to begin"
          title={t(lang, "home.featured")}
          description={t(lang, "home.featuredSub")}
          action={
            <Link href="/destinations" className="btn btn-ghost text-[13px]">
              {t(lang, "action.viewAll")} <ArrowRight className="size-4" aria-hidden />
            </Link>
          }
        />
        <StaggerGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((destination, index) => (
            <StaggerItem key={destination.slug}>
              <DestinationCard destination={destination} priority={index < 3} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      <section className="border-y border-ink-900/8 bg-ivory-100/60 py-16">
        <div className="page grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <p className="eyebrow mb-2.5">Beyond the highlights</p>
            <h2 className="display text-[clamp(1.85rem,3.6vw,2.75rem)] text-forest-900">{t(lang, "home.districts")}</h2>
            <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-ink-500">{t(lang, "home.districtsSub")}</p>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {["Dhaka", "Chattogram", "Khulna", "Rajshahi", "Barishal", "Sylhet", "Rangpur", "Mymensingh"].map((division) => (
                <Link key={division} href={`/districts?division=${division}`} className="chip text-[11.5px]">
                  {division}
                </Link>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/districts" className="btn btn-primary text-[13px]">
                Open the district directory
              </Link>
              <Link href="/map" className="btn btn-ghost text-[13px]">
                <MapPin className="size-4" aria-hidden /> Map view
              </Link>
            </div>
            <p className="mt-5 flex items-start gap-2 rounded-xl border border-forest-100 bg-forest-50 px-3 py-2.5 text-[11.5px] leading-relaxed text-forest-700">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              District pages state where information comes from and flag anything we have not verified.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid gap-2 sm:grid-cols-2">
              {districtsTeaser.map((district) => (
                <Link
                  key={district.slug}
                  href={`/districts/${district.slug}`}
                  className="group flex items-center justify-between gap-2 rounded-xl border border-ink-900/8 bg-white px-3.5 py-3 transition-all hover:border-forest-400 hover:shadow-sm"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[13.5px] font-semibold text-forest-900">{district.nameEn}</span>
                    <span className="block truncate text-[11.5px] text-ink-400">
                      <span lang="bn">{district.nameBn}</span> · {district.tagline}
                    </span>
                  </span>
                  <ArrowUpRight className="size-3.5 shrink-0 text-ink-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="page py-16" aria-labelledby="experiences-heading">
        <SectionHeading
          eyebrow="Choose a way to travel"
          title={t(lang, "home.experiences")}
          description={t(lang, "home.experiencesSub")}
          action={
            <Link href="/experiences" className="btn btn-ghost text-[13px]">
              All experiences <ArrowRight className="size-4" aria-hidden />
            </Link>
          }
        />
        <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-3 no-scrollbar md:mx-0 md:px-0">
          {experiencesList.map((experience) => (
            <ExperienceTile key={experience.slug} experience={experience} />
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-forest-950 py-16 text-ivory-100">
        <div className="absolute -right-24 -top-24 size-72 rounded-full bg-forest-800/60 blur-3xl" aria-hidden />
        <div className="page relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <p className="eyebrow mb-2.5 text-sunset-400">Bilingual AI agent</p>
            <h2 className="display text-[clamp(1.9rem,3.8vw,3rem)] text-ivory-50">{t(lang, "home.aiTitle")}</h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ivory-200/75">{t(lang, "home.aiSub")}</p>
            <ul className="mt-6 space-y-2.5">
              {AI_CAPABILITIES.map((capability) => (
                <li key={capability} className="flex items-start gap-2.5 text-[13.5px] text-ivory-200/85">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-sunset-400" aria-hidden />
                  {capability}
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap gap-2.5">
              <Link href="/ai-travel-agent" className="btn btn-sunset px-5 text-[13.5px]">
                <Sparkles className="size-4" aria-hidden /> {t(lang, "action.askAi")}
              </Link>
              <Link href="/trip-planner" className="btn btn-light px-5 text-[13.5px]">
                Open the planner
              </Link>
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-ivory-200/45">
              No bookings, no payments, no invented confirmations. If the AI key is not configured, the planner returns a
              data-based plan and says so.
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
              <div className="space-y-3">
                <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-tr-md bg-white/12 px-3.5 py-2.5 text-[12.5px] text-ivory-100">
                  আমি ৮,০০০ টাকার মধ্যে ৩ দিনের জন্য সিলেট ঘুরতে চাই।
                </div>
                <div className="max-w-[92%] rounded-2xl rounded-tl-md bg-ivory-50 px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-700">
                  <p className="font-semibold text-forest-900">সিলেট, ৩ দিন · আনুমানিক ৳৮,০০০</p>
                  <p className="mt-1.5">
                    আপনার বাজেটে থাকার জন্য সিলেট শহরে গেস্টহাউস, রাতারগুল বoat ট্রিপ আর শ্রীমঙ্গলের চা-বাগান — এই তিনটি
                    ধাপে সাজাচ্ছি। যাতায়াত ট্রেনে ধরলে খরচ কমবে।
                  </p>
                  <p className="mt-2 text-[10.5px] uppercase tracking-[0.12em] text-ink-400">Draft plan · estimates only</p>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-forest-900/60 px-3.5 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ivory-200/50">Grounded in</p>
                <p className="mt-1 text-[12px] text-ivory-200/80">
                  12 destination records · 158 attractions · 4 official advisories · 12 editorial guides
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="page py-16" aria-labelledby="packages-heading">
        <SectionHeading
          eyebrow="Costed outlines"
          title={t(lang, "home.packages")}
          description={t(lang, "home.packagesSub")}
          action={
            <Link href="/packages" className="btn btn-ghost text-[13px]">
              All templates <ArrowRight className="size-4" aria-hidden />
            </Link>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packageRows.map((row) => (
            <PackageCard key={row.pkg.id} pkg={row.pkg} destinationName={row.destinationName} />
          ))}
        </div>
        <p className="mt-5 flex items-start gap-2 rounded-xl border border-ivory-200 bg-white px-3.5 py-3 text-[11.5px] leading-relaxed text-ink-500">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-sunset-500" aria-hidden />
          These are trip templates, not products for sale. No operator is named until we have verified them, and no dates
          are shown as available. Prices are estimates from our own model.
        </p>
      </section>

      <section className="border-y border-ink-900/8 bg-ivory-100/60 py-16">
        <div className="page">
          <SectionHeading
            eyebrow="Seasons and access"
            title={t(lang, "home.seasons")}
            description={t(lang, "home.seasonsSub")}
            action={
              <Link href="/travel-guides" className="btn btn-ghost text-[13px]">
                <BookOpen className="size-4" aria-hidden /> Read the guides
              </Link>
            }
          />
          <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
            <SeasonGuide />
            <Reveal delay={0.08}>
              <div className="rounded-3xl border border-ink-900/8 bg-white p-5">
                <p className="eyebrow mb-2">Live advisories</p>
                <h3 className="text-[17px] font-bold text-forest-900">Before you book anything</h3>
                <p className="mt-1.5 text-[12px] text-ink-400">Maintained by the editorial team, with official sources.</p>
                <ul className="mt-4 space-y-3">
                  {alerts.map((alert) => (
                    <li key={alert.id} className="rounded-xl border border-ink-900/8 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[12.5px] font-semibold text-forest-900">{alert.title}</p>
                        <Badge tone={alert.severity === "warning" ? "sunset" : alert.severity === "caution" ? "river" : "neutral"}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="mt-1 line-clamp-3 text-[11.5px] leading-relaxed text-ink-500">{alert.body}</p>
                      {alert.sourceUrl ? (
                        <a
                          href={alert.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1.5 inline-flex items-center gap-1 text-[10.5px] font-semibold text-river-700 underline"
                        >
                          {alert.sourceName ?? "Official source"} <ExternalLink className="size-2.5" aria-hidden />
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="page py-16" aria-labelledby="culture-heading">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <Reveal>
            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
                <Image
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Mutton_Kacchi_Biriyani_Sultan_Dine.jpg/1280px-Mutton_Kacchi_Biriyani_Sultan_Dine.jpg"
                  alt="Kacchi biryani served in Old Dhaka"
                  fill
                  sizes="(max-width:1024px) 90vw, 45vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-5 -right-3 hidden w-44 overflow-hidden rounded-2xl border-4 border-ivory-50 shadow-lg sm:block">
                <div className="relative aspect-square">
                  <Image
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Tea_Girl_Moulvi_Bazar.jpg/1280px-Tea_Girl_Moulvi_Bazar.jpg"
                    alt="Tea picker in Moulvibazar"
                    fill
                    sizes="180px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="eyebrow mb-2.5">Taste, craft and custom</p>
            <h2 id="culture-heading" className="display text-[clamp(1.85rem,3.6vw,2.75rem)] text-forest-900">
              {t(lang, "home.food")}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-500">{t(lang, "home.foodSub")}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                {
                  icon: Utensils,
                  title: "Old Dhaka, hour by hour",
                  copy: "Bakarkhani at dawn, kacchi at noon, mishti doi before the launch ride.",
                  href: "/blog/what-to-eat-in-old-dhaka",
                },
                {
                  icon: Compass,
                  title: "Markets worth the detour",
                  copy: "Floating guava markets in winter, hilsa auctions at Chandpur, tea tastings in Srimangal.",
                  href: "/experiences#food-tourism",
                },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="group rounded-2xl border border-ink-900/8 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-sm">
                  <item.icon className="size-4 text-forest-600" aria-hidden />
                  <p className="mt-2.5 text-[13.5px] font-semibold text-forest-900">{item.title}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-ink-500">{item.copy}</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-river-700">
                    Read <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </Link>
              ))}
            </div>
            <p className="mt-4 rounded-xl border border-forest-100 bg-forest-50 px-3 py-2.5 text-[11.5px] leading-relaxed text-forest-700">
              Responsible tourism note: ask before photographing people at work, avoid single-use plastic in the hills and
              on the islands, and buy crafts directly from makers where you can.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="page pb-16" aria-labelledby="stories-heading">
        <SectionHeading
          eyebrow="Editorial"
          title={t(lang, "home.stories")}
          description={t(lang, "home.storiesSub")}
          action={
            <Link href="/travel-guides" className="btn btn-ghost text-[13px]">
              All guides <ArrowRight className="size-4" aria-hidden />
            </Link>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articleRows.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>

      <section className="page pb-20">
        <div className="relative overflow-hidden rounded-[28px] bg-forest-900 px-6 py-10 text-ivory-100 sm:px-10">
          <div className="absolute -left-20 -top-20 size-64 rounded-full bg-forest-700/50 blur-3xl" aria-hidden />
          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="eyebrow mb-2.5 text-sunset-400">Start planning</p>
              <h2 className="display text-[clamp(1.8rem,3.4vw,2.6rem)] text-ivory-50">
                Tell us the days and the budget. We&apos;ll do the arithmetic.
              </h2>
              <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-ivory-200/75">
                Build an itinerary, check what it costs, then verify the details with the people who run the boats,
                buses and guesthouses. That order saves money and disappointment.
              </p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                <Link href="/trip-planner" className="btn btn-sunset px-5 text-[13.5px]">
                  Plan my journey
                </Link>
                <Link href="/budget-calculator" className="btn btn-light px-5 text-[13.5px]">
                  Compare budgets
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sunset-400">{t(lang, "home.newsletter")}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-ivory-200/75">{t(lang, "home.newsletterSub")}</p>
              <div className="mt-3">
                <NewsletterForm source="home" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
