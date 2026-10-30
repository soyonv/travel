"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, ArrowRight, CalendarDays, Loader2, Sparkles, Users, Wallet } from "lucide-react";
import { useLang } from "@/components/providers/language-provider";
import { cn, formatBDT } from "@/lib/utils";

type DestinationOption = { slug: string; nameEn: string; category: string };
type PlanDay = {
  day: number;
  date: string;
  title: string;
  notes: string;
  activities: { time: string; title: string; kind: string; durationMin: number; costBdt: number; notes: string }[];
};
type Plan = {
  title: string;
  summary: string;
  destinationName: string;
  destinationSlug: string;
  days: PlanDay[];
  budget: { total: number; perPerson: number; transport: number; accommodation: number; food: number; activities: number };
  tips: string[];
  sources: { label: string; url: string }[];
  estimateNotice: string;
};

const INTERESTS = ["Beaches & Islands", "Nature & Waterfalls", "Hills & Adventure", "History & Heritage", "Food & Culture", "Family Travel"];

const today = new Date().toISOString().slice(0, 10);

export function PlannerWidget({ destinations }: { destinations: DestinationOption[] }) {
  const { t, lang } = useLang();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [source, setSource] = useState<"ai" | "data-model" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [interests, setInterests] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<number | null>(1);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const startDate = String(formData.get("startDate") ?? "");
    const endDate = String(formData.get("endDate") ?? "");
    const errors: Record<string, string> = {};
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      errors.endDate = "The return date is before the start date.";
    }
    const travelers = Number(formData.get("travelers"));
    if (!Number.isFinite(travelers) || travelers < 1 || travelers > 20) {
      errors.travelers = "Enter between 1 and 20 travellers.";
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setLoading(true);
    setError(null);
    setPlan(null);

    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          origin: String(formData.get("origin") ?? "Dhaka"),
          destinationSlug: String(formData.get("destinationSlug") ?? "") || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          days: Number(formData.get("days") ?? 3),
          travelers,
          budgetBdt: Number(formData.get("budgetBdt") ?? 0) || undefined,
          style: String(formData.get("style") ?? "standard"),
          accommodation: String(formData.get("accommodation") ?? "hotel"),
          transport: String(formData.get("transport") ?? "bus"),
          interests: interests.length ? interests : undefined,
          dietary: String(formData.get("dietary") ?? ""),
          lang,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "We could not build a plan. Please adjust the details and try again.");
      }
      setPlan(data.plan);
      setSource(data.source);
      setExpanded(1);
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPlan(null);
    setSource(null);
    setError(null);
  };

  return (
    <div className="relative -mt-16 sm:-mt-20">
      <div className="card overflow-hidden shadow-[0_40px_90px_-40px_rgba(7,28,22,0.45)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-900/8 bg-forest-50/60 px-5 py-4 sm:px-7">
          <div>
            <p className="eyebrow mb-1">BanglaVoyage AI</p>
            <h2 className="text-[19px] font-bold text-forest-900 sm:text-[21px]">
              {lang === "bn" ? "আপনার ভ্রমণ পরিকল্পনা তৈরি করুন" : "Build your trip plan"}
            </h2>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-forest-700 ring-1 ring-forest-100">
            <Sparkles className="size-3.5 text-sunset-500" aria-hidden />
            {source === "ai" ? "AI-generated" : "Grounded in local data"}
          </span>
        </div>

        <form onSubmit={onSubmit} className="px-5 py-6 sm:px-7">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="origin" className="label">
                Starting city
              </label>
              <input id="origin" name="origin" defaultValue="Dhaka" className="field" placeholder="Dhaka" />
            </div>
            <div>
              <label htmlFor="destinationSlug" className="label">
                Destination
              </label>
              <select id="destinationSlug" name="destinationSlug" className="field" defaultValue="">
                <option value="">Best match for me</option>
                {destinations.map((destination) => (
                  <option key={destination.slug} value={destination.slug}>
                    {destination.nameEn} — {destination.category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="startDate" className="label">
                Start date <span className="font-normal text-ink-400">({t("label.optional")})</span>
              </label>
              <input id="startDate" name="startDate" type="date" min={today} className="field" />
            </div>
            <div>
              <label htmlFor="endDate" className="label">
                End date <span className="font-normal text-ink-400">({t("label.optional")})</span>
              </label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                min={today}
                className="field"
                aria-invalid={fieldErrors.endDate ? "true" : undefined}
                aria-describedby={fieldErrors.endDate ? "endDate-error" : undefined}
              />
              {fieldErrors.endDate ? (
                <p id="endDate-error" className="mt-1 text-[11px] text-red-700">
                  {fieldErrors.endDate}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="days" className="label">
                Days (if no dates)
              </label>
              <input id="days" name="days" type="number" min={1} max={21} defaultValue={3} className="field" />
            </div>
            <div>
              <label htmlFor="travelers" className="label">
                {t("label.travelers")}
              </label>
              <input
                id="travelers"
                name="travelers"
                type="number"
                min={1}
                max={20}
                defaultValue={2}
                className="field"
                aria-invalid={fieldErrors.travelers ? "true" : undefined}
              />
              {fieldErrors.travelers ? <p className="mt-1 text-[11px] text-red-700">{fieldErrors.travelers}</p> : null}
            </div>
            <div>
              <label htmlFor="budgetBdt" className="label">
                {t("label.budget")} (৳, optional)
              </label>
              <input id="budgetBdt" name="budgetBdt" type="number" min={0} step={500} placeholder="e.g. 25000" className="field" />
            </div>
            <div>
              <label htmlFor="style" className="label">
                Travel style
              </label>
              <select id="style" name="style" className="field" defaultValue="standard">
                <option value="budget">Budget</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
              </select>
            </div>

            <div>
              <label htmlFor="accommodation" className="label">
                Accommodation
              </label>
              <select id="accommodation" name="accommodation" className="field" defaultValue="hotel">
                <option value="hostel">Hostel</option>
                <option value="guesthouse">Guesthouse</option>
                <option value="hotel">Hotel</option>
                <option value="resort">Resort</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>
            <div>
              <label htmlFor="transport" className="label">
                Transport
              </label>
              <select id="transport" name="transport" className="field" defaultValue="bus">
                <option value="bus">Bus</option>
                <option value="train">Train</option>
                <option value="flight">Flight</option>
                <option value="private_car">Private car</option>
                <option value="mixed">Mix of modes</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="dietary" className="label">
                Dietary or accessibility needs <span className="font-normal text-ink-400">({t("label.optional")})</span>
              </label>
              <input
                id="dietary"
                name="dietary"
                className="field"
                placeholder="Vegetarian, no chilli, step-free access…"
              />
            </div>
          </div>

          <fieldset className="mt-4">
            <legend className="label">Interests</legend>
            <div className="flex flex-wrap gap-1.5">
              {INTERESTS.map((interest) => {
                const selected = interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    aria-pressed={selected}
                    data-active={selected}
                    onClick={() =>
                      setInterests((current) =>
                        current.includes(interest) ? current.filter((item) => item !== interest) : [...current, interest],
                      )
                    }
                    className="chip text-[11.5px]"
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="submit" disabled={loading} className="btn btn-primary px-6 text-[14px] disabled:opacity-70">
              {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Sparkles className="size-4" aria-hidden />}
              {loading ? "Building your plan…" : "Create my AI trip plan"}
            </button>
            <p className="text-[11px] leading-snug text-ink-400">
              Estimates only. Nothing is booked, and no payment is taken.
            </p>
          </div>

          {error ? (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-[12.5px] text-red-800">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              <p>{error}</p>
            </div>
          ) : null}
        </form>

        {loading ? (
          <div className="space-y-3 border-t border-ink-900/8 px-5 py-6 sm:px-7" aria-live="polite">
            <div className="skeleton h-5 w-2/3 rounded" />
            <div className="skeleton h-3 w-full rounded" />
            <div className="skeleton h-3 w-5/6 rounded" />
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="skeleton h-16 rounded-xl" />
              <div className="skeleton h-16 rounded-xl" />
              <div className="skeleton h-16 rounded-xl" />
            </div>
            <p className="text-[11.5px] text-ink-400">Checking distances, opening patterns and the cost model…</p>
          </div>
        ) : null}

        {plan ? (
          <div className="border-t border-ink-900/8 bg-ivory-50/70 px-5 py-6 sm:px-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="eyebrow mb-1.5">{source === "ai" ? "AI draft" : "Data-based draft"}</p>
                <h3 className="text-[21px] font-bold text-forest-900">{plan.title}</h3>
                <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ink-500">{plan.summary}</p>
              </div>
              <button type="button" onClick={reset} className="btn btn-ghost px-3.5 py-1.5 text-[12px]">
                Start over
              </button>
            </div>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
              {[
                { icon: Wallet, label: t("label.estimatedTotal"), value: formatBDT(plan.budget.total), note: `${formatBDT(plan.budget.perPerson)} ${t("label.perPerson")}` },
                { icon: CalendarDays, label: "Itinerary", value: `${plan.days.length} days`, note: plan.destinationName },
                { icon: Users, label: "Includes", value: "Stay, food, transport", note: "Estimates, not bookings" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-ink-900/8 bg-white px-3.5 py-3">
                  <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-400">
                    <item.icon className="size-3" aria-hidden /> {item.label}
                  </p>
                  <p className="mt-1 text-[16px] font-bold text-forest-900">{item.value}</p>
                  <p className="text-[11px] text-ink-400">{item.note}</p>
                </div>
              ))}
            </div>

            <ol className="mt-4 space-y-2">
              {plan.days.slice(0, 3).map((day) => (
                <li key={day.day} className="overflow-hidden rounded-xl border border-ink-900/8 bg-white">
                  <button
                    type="button"
                    onClick={() => setExpanded(expanded === day.day ? null : day.day)}
                    aria-expanded={expanded === day.day}
                    className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left"
                  >
                    <span className="text-[13px] font-semibold text-forest-900">
                      Day {day.day}
                      {day.date ? <span className="ml-2 text-[11px] font-normal text-ink-400">{day.date}</span> : null}
                      <span className="ml-2 font-normal text-ink-500">· {day.title}</span>
                    </span>
                    <span className="text-[11px] text-ink-400">{day.activities.length} stops</span>
                  </button>
                  {expanded === day.day ? (
                    <ul className="divide-y divide-ink-900/5 border-t border-ink-900/5">
                      {day.activities.map((activity, index) => (
                        <li key={index} className="flex gap-3 px-3.5 py-2">
                          <span className="w-11 shrink-0 text-[11px] font-semibold text-forest-600">{activity.time}</span>
                          <span className="min-w-0">
                            <span className="block text-[12.5px] font-medium text-ink-700">{activity.title}</span>
                            <span className="block text-[11px] text-ink-400">
                              {activity.durationMin} min
                              {activity.costBdt ? ` · about ${formatBDT(activity.costBdt)}` : ""}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ol>
            {plan.days.length > 3 ? (
              <p className="mt-2 text-[11.5px] text-ink-400">
                + {plan.days.length - 3} more day{plan.days.length - 3 === 1 ? "" : "s"} in the full planner.
              </p>
            ) : null}

            <div className={cn("mt-4 rounded-xl border px-3.5 py-3 text-[11.5px] leading-relaxed", source === "ai" ? "border-river-100 bg-river-50 text-river-700" : "border-sunset-100 bg-sunset-100/50 text-sunset-600")}>
              {plan.estimateNotice}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/trip-planner" className="btn btn-primary px-4 py-2 text-[12.5px]">
                Open the full planner <ArrowRight className="size-3.5" aria-hidden />
              </Link>
              <Link href={`/destinations/${plan.destinationSlug}`} className="btn btn-ghost px-4 py-2 text-[12.5px]">
                About {plan.destinationName}
              </Link>
              <Link href="/ai-travel-agent" className="btn btn-ghost px-4 py-2 text-[12.5px]">
                Ask a follow-up
              </Link>
            </div>

            {plan.sources.length ? (
              <p className="mt-3 text-[11px] text-ink-400">
                Sources:{" "}
                {plan.sources.map((source, index) => (
                  <span key={source.url}>
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-forest-700">
                      {source.label}
                    </a>
                    {index < plan.sources.length - 1 ? ", " : ""}
                  </span>
                ))}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
