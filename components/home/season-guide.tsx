"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, ArrowUpRight, CloudRain, Sun } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { SEASONS } from "@/lib/seasons";
import { MONTHS } from "@/lib/i18n";
import { useLang } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

export function SeasonGuide() {
  const { lang } = useLang();
  const reduce = useReducedMotion();
  const [month, setMonth] = useState(new Date().getMonth());
  const guide = SEASONS[month];
  const months = MONTHS[lang];

  return (
    <div className="overflow-hidden rounded-3xl border border-ink-900/8 bg-white shadow-[var(--shadow-soft)]">
      <div className="flex gap-1 overflow-x-auto border-b border-ink-900/8 bg-ivory-100/60 px-3 py-2.5 no-scrollbar">
        {months.map((label, index) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={index === month}
            onClick={() => setMonth(index)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors",
              index === month ? "bg-forest-800 text-ivory-50" : "text-ink-500 hover:bg-white",
            )}
          >
            {label.slice(0, 3)}
          </button>
        ))}
      </div>

      <div className="grid gap-6 p-5 sm:p-7 md:grid-cols-[1.25fr_1fr]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-100 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-forest-800">
              {guide.season === "Monsoon" ? <CloudRain className="size-3" aria-hidden /> : <Sun className="size-3" aria-hidden />}
              {guide.season}
            </span>
            <span className="rounded-full bg-ivory-100 px-2.5 py-1 text-[10.5px] font-semibold text-ink-500">{guide.temperature}</span>
          </div>
          <h3 className="mt-3 text-[22px] font-bold text-forest-900">{months[month]}</h3>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-500">{guide.weather}</p>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-700">{guide.note}</p>
          {guide.caution ? (
            <p className="mt-3 flex items-start gap-2 rounded-xl border border-sunset-100 bg-sunset-100/50 px-3 py-2.5 text-[12px] leading-relaxed text-sunset-600">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              {guide.caution}
            </p>
          ) : null}
        </div>

        <div>
          <p className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.16em] text-ink-400">Good this month</p>
          <ul className="space-y-1.5">
            {guide.picks.map((pick) => (
              <li key={pick.slug}>
                <Link
                  href={`/destinations/${pick.slug}`}
                  className="group flex items-center justify-between gap-2 rounded-xl border border-ink-900/8 px-3 py-2.5 transition-colors hover:border-forest-400 hover:bg-forest-50"
                >
                  <span className="text-[13px] font-semibold text-forest-900">{pick.name}</span>
                  <ArrowUpRight className="size-3.5 text-ink-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
          <p className={cn("mt-3 text-[11px] leading-relaxed text-ink-400", reduce && "mt-3")}>
            Seasonal guidance, not a weather forecast. Check the Bangladesh Meteorological Department and local officials
            before travelling.
          </p>
        </div>
      </div>
    </div>
  );
}
