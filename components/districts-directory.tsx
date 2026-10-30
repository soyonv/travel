"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, Search, X } from "lucide-react";
import { DistrictCard } from "@/components/cards";
import { useLang } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

export type DistrictListItem = {
  slug: string;
  nameEn: string;
  nameBn: string;
  division: string;
  tagline: string | null;
  image: string | null;
  attractions: number;
};

export function DistrictsDirectory({ districts }: { districts: DistrictListItem[] }) {
  const { lang } = useLang();
  const [query, setQuery] = useState("");
  const [division, setDivision] = useState<string>("all");

  const divisions = useMemo(
    () => Array.from(new Set(districts.map((district) => district.division))).sort(),
    [districts],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return districts.filter((district) => {
      if (division !== "all" && district.division !== division) return false;
      if (!term) return true;
      return [district.nameEn, district.nameBn, district.division, district.tagline ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [districts, division, query]);

  return (
    <div>
      <div className="card p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <label htmlFor="district-search" className="sr-only">
              Search districts
            </label>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
            <input
              id="district-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={lang === "bn" ? "জেলা খুঁজুন — ঢাকা, সিলেট…" : "Search a district — Dhaka, Sylhet, Khulna…"}
              className="field pl-9 pr-9"
              autoComplete="off"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-400 hover:bg-ivory-100"
                aria-label="Clear search"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            ) : null}
          </div>
          <p className="text-[12px] text-ink-500" aria-live="polite">
            {filtered.length} of {districts.length} districts
          </p>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setDivision("all")}
            aria-pressed={division === "all"}
            data-active={division === "all"}
            className="chip text-[11.5px]"
          >
            All divisions
          </button>
          {divisions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setDivision(item)}
              aria-pressed={division === item}
              data-active={division === item}
              className="chip text-[11.5px]"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((district) => (
          <div key={district.slug} className="relative">
            <DistrictCard district={district} />
            {district.attractions > 0 ? (
              <span
                className={cn(
                  "pointer-events-none absolute right-10 top-3.5 inline-flex items-center gap-1 rounded-full bg-forest-50 px-2 py-0.5 text-[10px] font-semibold text-forest-700",
                )}
              >
                <MapPin className="size-2.5" aria-hidden /> {district.attractions}
              </span>
            ) : null}
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-ink-900/15 px-6 py-10 text-center">
          <p className="text-[14px] font-semibold text-forest-900">No district matches “{query}”</p>
          <p className="mt-1 text-[12.5px] text-ink-500">
            Try the English spelling, or{" "}
            <Link href="/destinations" className="text-river-700 underline">
              browse destinations instead
            </Link>
            .
          </p>
        </div>
      ) : null}
    </div>
  );
}
