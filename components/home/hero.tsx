"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, ChevronDown, Compass, Sparkles } from "lucide-react";
import { HeroSearch } from "@/components/home/hero-search";
import { useLang } from "@/components/providers/language-provider";

export type HeroSlide = {
  slug: string;
  nameEn: string;
  category: string;
  image: string;
  credit: string | null;
  creditUrl: string | null;
};

const FILTERS = [
  { label: "Nature & waterfalls", href: "/destinations?category=Nature%20%26%20Waterfalls" },
  { label: "Beaches & islands", href: "/destinations?category=Beaches%20%26%20Islands" },
  { label: "Hills & adventure", href: "/destinations?category=Hills%20%26%20Adventure" },
  { label: "History & heritage", href: "/destinations?category=History%20%26%20Heritage" },
  { label: "Food & culture", href: "/experiences#food-tourism" },
  { label: "Family travel", href: "/experiences#family-holidays" },
];

export function Hero({ slides }: { slides: HeroSlide[] }) {
  const { lang, t } = useLang();
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduce || slides.length < 2) return;
    const timer = setInterval(() => setActive((current) => (current + 1) % slides.length), 7000);
    return () => clearInterval(timer);
  }, [reduce, slides.length]);

  const headline = t("home.heroTitle").split(" ");
  const current = slides[active];

  return (
    <section className="relative isolate min-h-[88svh] overflow-hidden bg-forest-950 text-ivory-50">
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={slide.slug}
            className="absolute inset-0 transition-opacity duration-[1600ms] ease-out"
            style={{ opacity: index === active ? 1 : 0 }}
            aria-hidden={index !== active}
          >
            <div
              className="absolute inset-0"
              style={index === active && !reduce ? { animation: "kenburns 16s ease-out forwards" } : undefined}
            >
              <Image
                src={slide.image}
                alt={index === active ? `${slide.nameEn}, Bangladesh` : ""}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover"
              />
            </div>
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-forest-950/90 via-forest-950/60 to-forest-950/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950/85 via-transparent to-forest-950/40" />
      </div>

      {!reduce ? (
        <div className="pointer-events-none absolute inset-0 hidden overflow-hidden md:block" aria-hidden>
          {[
            { left: "12%", size: 3, delay: 0, duration: 14 },
            { left: "24%", size: 2, delay: 3, duration: 18 },
            { left: "38%", size: 4, delay: 6, duration: 16 },
            { left: "55%", size: 2, delay: 1, duration: 20 },
            { left: "68%", size: 3, delay: 8, duration: 15 },
            { left: "81%", size: 2, delay: 4, duration: 19 },
            { left: "91%", size: 3, delay: 10, duration: 17 },
          ].map((particle, index) => (
            <span
              key={index}
              className="absolute bottom-24 rounded-full bg-ivory-100/50"
              style={{
                left: particle.left,
                width: particle.size,
                height: particle.size,
                animation: `float-slow ${particle.duration}s linear infinite`,
                animationDelay: `${particle.delay}s`,
              }}
            />
          ))}
        </div>
      ) : null}

      <div className="page relative flex min-h-[88svh] flex-col justify-center pb-16 pt-14 sm:pt-20">
        <div className="max-w-3xl">
          <motion.p
            initial={reduce ? undefined : { opacity: 0, y: 10 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-ivory-100 backdrop-blur-sm"
          >
            <Compass className="size-3.5 text-sunset-400" aria-hidden />
            Bangladesh, planned properly
          </motion.p>

          <h1 className="display max-w-3xl text-[clamp(2.6rem,7vw,5.1rem)] leading-[0.98] text-white">
            {headline.map((word, index) => (
              <motion.span
                key={`${word}-${index}`}
                className="inline-block"
                initial={reduce ? undefined : { opacity: 0, y: 26, filter: "blur(6px)" }}
                animate={reduce ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, delay: 0.12 + index * 0.07, ease: [0.22, 1, 0.36, 1] }}
              >
                {word}
                {index < headline.length - 1 ? "\u00A0" : ""}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={reduce ? undefined : { opacity: 0, y: 14 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="mt-5 max-w-xl text-[15px] leading-relaxed text-ivory-200/85 sm:text-[16.5px]"
          >
            {t("home.heroSub")}
          </motion.p>

          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 16 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.58 }}
            className="mt-7 flex flex-wrap items-center gap-3"
          >
            <Link href="/trip-planner" className="btn btn-sunset px-6 text-[14px]">
              <Sparkles className="size-4" aria-hidden />
              {t("action.plan")}
            </Link>
            <Link href="/destinations" className="btn btn-light px-5 text-[14px]">
              {t("action.explore")}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </motion.div>

          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 18 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="mt-7"
          >
            <HeroSearch />
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {FILTERS.map((filter) => (
                <Link
                  key={filter.href}
                  href={filter.href}
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11.5px] font-medium text-ivory-100 backdrop-blur-sm transition-colors hover:border-sunset-400 hover:bg-white/20"
                >
                  {filter.label}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="mt-10 flex items-end justify-between gap-4">
          <div className="flex items-center gap-2" role="tablist" aria-label="Featured scenes">
            {slides.map((slide, index) => (
              <button
                key={slide.slug}
                type="button"
                role="tab"
                aria-selected={index === active}
                aria-label={`Show ${slide.nameEn}`}
                onClick={() => setActive(index)}
                className={`h-1 rounded-full transition-all duration-500 ${
                  index === active ? "w-9 bg-sunset-400" : "w-4 bg-white/35 hover:bg-white/60"
                }`}
              />
            ))}
            <span className="ml-2 text-[11px] font-medium uppercase tracking-[0.16em] text-ivory-200/65">
              {current?.category}
              <span className="mx-1.5 text-ivory-200/30">/</span>
              <span lang={lang}>{current?.nameEn}</span>
            </span>
          </div>

          <div className="flex flex-col items-end gap-2">
            {current?.credit ? (
              <a
                href={current.creditUrl ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-ivory-200/45 underline decoration-white/20 underline-offset-2 hover:text-ivory-100"
              >
                Photo: {current.credit} · {current.nameEn}
              </a>
            ) : null}
            <span className="hidden items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-ivory-200/50 sm:flex">
              Scroll
              <ChevronDown className={`size-3.5 ${reduce ? "" : "animate-bounce"}`} aria-hidden />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
