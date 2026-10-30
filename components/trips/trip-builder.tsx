"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CalendarDays,
  Clock,
  GripVertical,
  Loader2,
  Plus,
  Printer,
  Save,
  Share2,
  Sparkles,
  Trash2,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { saveTripAction, setTripSharingAction, type TripActionResult } from "@/app/actions/trips";
import { useLang } from "@/components/providers/language-provider";
import { cn, formatBDT } from "@/lib/utils";

type Activity = {
  time: string;
  title: string;
  kind: "travel" | "activity" | "meal" | "rest" | "checkin" | "note";
  durationMin: number;
  costBdt: number;
  notes: string;
};

type Day = { day: number; date: string; title: string; base: string; notes: string; activities: Activity[] };

export type BuilderPlan = {
  title: string;
  summary: string;
  destinationSlug: string;
  destinationName: string;
  days: Day[];
  budget: {
    transport: number;
    accommodation: number;
    food: number;
    localTransport: number;
    activities: number;
    contingency: number;
    total: number;
    perPerson: number;
  };
  tips: string[];
  sources: { label: string; url: string }[];
  estimateNotice: string;
};

export type SavedTripInput = {
  id: string;
  name: string;
  origin: string | null;
  destination: string | null;
  startDate: string | null;
  endDate: string | null;
  travelers: number;
  budgetBdt: number | null;
  style: string | null;
  notes: string | null;
  shareToken: string | null;
  isPublic: number;
  days: {
    dayIndex: number;
    date: string | null;
    title: string | null;
    notes: string | null;
    activities: {
      timeLabel: string | null;
      title: string;
      kind: string;
      durationMin: number | null;
      costBdt: number | null;
      notes: string | null;
    }[];
  }[];
};

type DestinationOption = { slug: string; nameEn: string; category: string };

const INTERESTS = ["Beaches & Islands", "Nature & Waterfalls", "Hills & Adventure", "History & Heritage", "Food & Culture", "Family Travel"];

function fromSavedTrip(trip: SavedTripInput): BuilderPlan {
  return {
    title: trip.name,
    summary: "An itinerary you saved earlier. Values are estimates and may need updating.",
    destinationSlug: "",
    destinationName: trip.destination ?? "",
    days: trip.days.map((day) => ({
      day: day.dayIndex,
      date: day.date ?? "",
      title: day.title ?? `Day ${day.dayIndex}`,
      base: "",
      notes: day.notes ?? "",
      activities: day.activities.map((activity) => ({
        time: activity.timeLabel ?? "",
        title: activity.title,
        kind: (["travel", "activity", "meal", "rest", "checkin", "note"].includes(activity.kind)
          ? activity.kind
          : "activity") as Activity["kind"],
        durationMin: activity.durationMin ?? 60,
        costBdt: activity.costBdt ?? 0,
        notes: activity.notes ?? "",
      })),
    })),
    budget: {
      transport: 0,
      accommodation: 0,
      food: 0,
      localTransport: 0,
      activities: 0,
      contingency: 0,
      total: trip.budgetBdt ?? 0,
      perPerson: trip.budgetBdt && trip.travelers ? Math.round(trip.budgetBdt / trip.travelers) : 0,
    },
    tips: [],
    sources: [],
    estimateNotice: "Saved itinerary. Costs are estimates from when it was created.",
  };
}

const inputClass = "field py-2 text-[12.5px]";

export function TripBuilder({
  destinations,
  initialTrip = null,
  initialDestination = "",
  isAuthed,
}: {
  destinations: DestinationOption[];
  initialTrip?: SavedTripInput | null;
  initialDestination?: string;
  isAuthed: boolean;
}) {
  const { lang } = useLang();
  const [meta, setMeta] = useState({
    tripId: initialTrip?.id ?? "",
    name: initialTrip?.name ?? "My Bangladesh trip",
    origin: initialTrip?.origin ?? "Dhaka",
    startDate: initialTrip?.startDate ?? "",
    endDate: initialTrip?.endDate ?? "",
    travelers: initialTrip?.travelers ?? 2,
    budgetBdt: initialTrip?.budgetBdt ?? 25000,
    style: (initialTrip?.style as "budget" | "standard" | "premium") ?? "standard",
    notes: initialTrip?.notes ?? "",
  });
  const [form, setForm] = useState({
    destinationSlug: initialTrip ? "" : initialDestination,
    days: 3,
    accommodation: "hotel",
    transport: "bus",
    dietary: "",
  });
  const [interests, setInterests] = useState<string[]>([]);
  const [plan, setPlan] = useState<BuilderPlan | null>(initialTrip ? fromSavedTrip(initialTrip) : null);
  const [source, setSource] = useState<"ai" | "data-model" | null>(initialTrip ? "data-model" : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<TripActionResult | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(initialTrip?.shareToken ?? null);
  const [sharing, setSharing] = useState(false);
  const [drag, setDrag] = useState<{ day: number; index: number } | null>(null);
  const [addingDay, setAddingDay] = useState<number | null>(null);
  const [draft, setDraft] = useState<Activity>({ time: "10:00", title: "", kind: "activity", durationMin: 60, costBdt: 0, notes: "" });

  const totalActivities = useMemo(
    () => plan?.days.reduce((sum, day) => sum + day.activities.length, 0) ?? 0,
    [plan],
  );

  const generate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSaveResult(null);

    if (meta.startDate && meta.endDate && new Date(meta.endDate) < new Date(meta.startDate)) {
      setError("The return date is before the start date.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          origin: meta.origin,
          destinationSlug: form.destinationSlug || undefined,
          startDate: meta.startDate || undefined,
          endDate: meta.endDate || undefined,
          days: form.days,
          travelers: meta.travelers,
          budgetBdt: meta.budgetBdt || undefined,
          style: meta.style,
          accommodation: form.accommodation,
          transport: form.transport,
          interests: interests.length ? interests : undefined,
          dietary: form.dietary,
          lang,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "The planner could not build a plan. Please adjust and retry.");
      setPlan(data.plan as BuilderPlan);
      setSource(data.source);
      setMeta((current) => ({ ...current, tripId: "", name: `${(data.plan as BuilderPlan).destinationName} trip` }));
      setShareToken(null);
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const updateActivity = (dayIndex: number, activityIndex: number, patch: Partial<Activity>) => {
    setPlan((current) => {
      if (!current) return current;
      return {
        ...current,
        days: current.days.map((day, index) =>
          index === dayIndex
            ? {
                ...day,
                activities: day.activities.map((activity, i) => (i === activityIndex ? { ...activity, ...patch } : activity)),
              }
            : day,
        ),
      };
    });
  };

  const removeActivity = (dayIndex: number, activityIndex: number) => {
    setPlan((current) => {
      if (!current) return current;
      return {
        ...current,
        days: current.days.map((day, index) =>
          index === dayIndex ? { ...day, activities: day.activities.filter((_, i) => i !== activityIndex) } : day,
        ),
      };
    });
  };

  const moveActivity = (dayIndex: number, from: number, to: number) => {
    setPlan((current) => {
      if (!current) return current;
      return {
        ...current,
        days: current.days.map((day, index) => {
          if (index !== dayIndex) return day;
          if (to < 0 || to >= day.activities.length) return day;
          const activities = [...day.activities];
          const [moved] = activities.splice(from, 1);
          activities.splice(to, 0, moved);
          return { ...day, activities };
        }),
      };
    });
  };

  const addActivity = (dayIndex: number) => {
    if (!draft.title.trim()) return;
    setPlan((current) => {
      if (!current) return current;
      return {
        ...current,
        days: current.days.map((day, index) =>
          index === dayIndex ? { ...day, activities: [...day.activities, { ...draft, title: draft.title.trim() }] } : day,
        ),
      };
    });
    setDraft({ time: "10:00", title: "", kind: "activity", durationMin: 60, costBdt: 0, notes: "" });
    setAddingDay(null);
  };

  const addDay = () => {
    setPlan((current) => {
      if (!current) return current;
      if (current.days.length >= 21) return current;
      const next = current.days.length + 1;
      return {
        ...current,
        days: [
          ...current.days,
          {
            day: next,
            date: "",
            title: `Day ${next}`,
            base: "",
            notes: "",
            activities: [{ time: "10:00", title: "Free morning", kind: "activity", durationMin: 90, costBdt: 0, notes: "Add your own stops." }],
          },
        ],
      };
    });
  };

  const removeDay = (dayIndex: number) => {
    setPlan((current) => {
      if (!current || current.days.length <= 1) return current;
      return {
        ...current,
        days: current.days.filter((_, index) => index !== dayIndex).map((day, index) => ({ ...day, day: index + 1 })),
      };
    });
  };

  const save = async () => {
    if (!plan) return;
    if (!isAuthed) {
      setSaveResult({ ok: false, message: "Sign in to save this itinerary to your account.", requiresAuth: true });
      return;
    }
    setSaving(true);
    setSaveResult(null);
    try {
      const result = await saveTripAction({
        meta: {
          tripId: meta.tripId || undefined,
          name: meta.name,
          origin: meta.origin,
          destination: plan.destinationName,
          startDate: meta.startDate,
          endDate: meta.endDate,
          travelers: meta.travelers,
          budgetBdt: meta.budgetBdt || plan.budget.total,
          style: meta.style,
          notes: meta.notes,
        },
        plan,
      });
      setSaveResult(result);
      if (result.ok && result.tripId) {
        setMeta((current) => ({ ...current, tripId: result.tripId! }));
        if (result.shareToken) setShareToken(result.shareToken);
      }
    } catch {
      setSaveResult({ ok: false, message: "Something went wrong while saving. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const toggleShare = async () => {
    if (!meta.tripId) {
      setSaveResult({ ok: false, message: "Save the itinerary first, then you can share it." });
      return;
    }
    setSharing(true);
    try {
      const result = await setTripSharingAction(meta.tripId, !shareToken);
      setSaveResult(result);
      if (result.ok) {
        setShareToken(result.shareToken ? (shareToken ? null : result.shareToken) : null);
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
      <form onSubmit={generate} className="card h-fit p-5 lg:sticky lg:top-24 print:hidden" aria-label="Generate an itinerary">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-sunset-500" aria-hidden />
          <h2 className="text-[16px] font-bold text-forest-900">Build a draft</h2>
        </div>
        <p className="mt-1 text-[11.5px] leading-relaxed text-ink-400">
          {isAuthed ? "Saved to your account when you press save." : "You can build for free; saving needs an account."}
        </p>

        <div className="mt-4 space-y-3">
          <div>
            <label htmlFor="trip-name" className="label">
              Trip name
            </label>
            <input
              id="trip-name"
              value={meta.name}
              onChange={(event) => setMeta({ ...meta, name: event.target.value })}
              className="field"
              maxLength={120}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="trip-origin" className="label">
                From
              </label>
              <input
                id="trip-origin"
                value={meta.origin}
                onChange={(event) => setMeta({ ...meta, origin: event.target.value })}
                className="field"
              />
            </div>
            <div>
              <label htmlFor="trip-travelers" className="label">
                Travellers
              </label>
              <input
                id="trip-travelers"
                type="number"
                min={1}
                max={20}
                value={meta.travelers}
                onChange={(event) => setMeta({ ...meta, travelers: Number(event.target.value) })}
                className="field"
              />
            </div>
          </div>
          <div>
            <label htmlFor="trip-destination" className="label">
              Destination
            </label>
            <select
              id="trip-destination"
              value={form.destinationSlug}
              onChange={(event) => setForm({ ...form, destinationSlug: event.target.value })}
              className="field"
            >
              <option value="">Best match for my interests</option>
              {destinations.map((destination) => (
                <option key={destination.slug} value={destination.slug}>
                  {destination.nameEn} — {destination.category}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="trip-start" className="label">
                Start
              </label>
              <input
                id="trip-start"
                type="date"
                value={meta.startDate}
                onChange={(event) => setMeta({ ...meta, startDate: event.target.value })}
                className="field"
              />
            </div>
            <div>
              <label htmlFor="trip-end" className="label">
                End
              </label>
              <input
                id="trip-end"
                type="date"
                value={meta.endDate}
                onChange={(event) => setMeta({ ...meta, endDate: event.target.value })}
                className="field"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="trip-days" className="label">
                Days (if no dates)
              </label>
              <input
                id="trip-days"
                type="number"
                min={1}
                max={21}
                value={form.days}
                onChange={(event) => setForm({ ...form, days: Number(event.target.value) })}
                className="field"
              />
            </div>
            <div>
              <label htmlFor="trip-budget" className="label">
                Budget (৳)
              </label>
              <input
                id="trip-budget"
                type="number"
                min={0}
                step={500}
                value={meta.budgetBdt}
                onChange={(event) => setMeta({ ...meta, budgetBdt: Number(event.target.value) })}
                className="field"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="trip-accommodation" className="label">
                Stay
              </label>
              <select
                id="trip-accommodation"
                value={form.accommodation}
                onChange={(event) => setForm({ ...form, accommodation: event.target.value })}
                className="field"
              >
                <option value="hostel">Hostel</option>
                <option value="guesthouse">Guesthouse</option>
                <option value="hotel">Hotel</option>
                <option value="resort">Resort</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>
            <div>
              <label htmlFor="trip-transport" className="label">
                Transport
              </label>
              <select
                id="trip-transport"
                value={form.transport}
                onChange={(event) => setForm({ ...form, transport: event.target.value })}
                className="field"
              >
                <option value="bus">Coach</option>
                <option value="train">Train</option>
                <option value="flight">Flight</option>
                <option value="private_car">Private car</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="trip-style" className="label">
              Style
            </label>
            <select
              id="trip-style"
              value={meta.style}
              onChange={(event) => setMeta({ ...meta, style: event.target.value as typeof meta.style })}
              className="field"
            >
              <option value="budget">Budget</option>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
            </select>
          </div>
          <div>
            <span className="label">Interests</span>
            <div className="flex flex-wrap gap-1.5">
              {INTERESTS.map((interest) => {
                const active = interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    aria-pressed={active}
                    data-active={active}
                    onClick={() =>
                      setInterests((current) =>
                        current.includes(interest) ? current.filter((item) => item !== interest) : [...current, interest],
                      )
                    }
                    className="chip text-[11px]"
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label htmlFor="trip-dietary" className="label">
              Dietary or access needs
            </label>
            <input
              id="trip-dietary"
              value={form.dietary}
              onChange={(event) => setForm({ ...form, dietary: event.target.value })}
              className="field"
              placeholder="Vegetarian, step-free access…"
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary mt-4 w-full px-5 text-[13px] disabled:opacity-70">
          {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Sparkles className="size-4" aria-hidden />}
          {loading ? "Building…" : "Create my AI trip plan"}
        </button>
        <p className="mt-2 text-[10.5px] leading-relaxed text-ink-400">
          The AI is grounded in this site&apos;s destination data. Costs are estimates. Nothing is booked.
        </p>
        {error ? (
          <p role="alert" className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[12px] text-red-800">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden /> {error}
          </p>
        ) : null}
      </form>

      <div className="space-y-4">
        {loading ? (
          <div className="card space-y-3 p-5" aria-live="polite">
            <div className="skeleton h-6 w-2/3 rounded" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-24 rounded-xl" />
            <div className="skeleton h-24 rounded-xl" />
            <p className="text-[11.5px] text-ink-400">Working out travel time, meal breaks and an estimate…</p>
          </div>
        ) : null}

        {!plan && !loading ? (
          <div className="card p-8 text-center">
            <CalendarDays className="mx-auto size-7 text-forest-400" aria-hidden />
            <p className="mt-3 text-[15px] font-bold text-forest-900">No itinerary yet</p>
            <p className="mx-auto mt-1 max-w-sm text-[12.5px] leading-relaxed text-ink-500">
              Choose a destination and dates, or let the interests decide. You will get a day-by-day draft you can reorder,
              trim and print.
            </p>
          </div>
        ) : null}

        {plan ? (
          <>
            <div className="card overflow-hidden">
              <div className="border-b border-ink-900/8 bg-forest-50/60 px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="eyebrow mb-1">{source === "ai" ? "AI draft" : "Data-based draft"}</p>
                    <h2 className="text-[20px] font-bold text-forest-900">{meta.name}</h2>
                    <p className="mt-1 text-[12.5px] text-ink-500">
                      {plan.destinationName} · {plan.days.length} days · {totalActivities} stops
                    </p>
                  </div>
                  <div className="flex gap-2 print:hidden">
                    <button type="button" onClick={() => window.print()} className="btn btn-ghost px-3 py-1.5 text-[11.5px]">
                      <Printer className="size-3.5" aria-hidden /> Print
                    </button>
                    <button type="button" onClick={addDay} className="btn btn-ghost px-3 py-1.5 text-[11.5px]">
                      <Plus className="size-3.5" aria-hidden /> Day
                    </button>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-ink-900/5">
                    <p className="flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-[0.1em] text-ink-400">
                      <Wallet className="size-2.5" aria-hidden /> Estimated total
                    </p>
                    <p className="text-[15px] font-bold text-forest-900">{formatBDT(plan.budget.total)}</p>
                  </div>
                  <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-ink-900/5">
                    <p className="flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-[0.1em] text-ink-400">
                      <Users className="size-2.5" aria-hidden /> Per person
                    </p>
                    <p className="text-[15px] font-bold text-forest-900">{formatBDT(plan.budget.perPerson)}</p>
                  </div>
                  <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-ink-900/5">
                    <p className="flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-[0.1em] text-ink-400">
                      <CalendarDays className="size-2.5" aria-hidden /> Days
                    </p>
                    <p className="text-[15px] font-bold text-forest-900">{plan.days.length}</p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-ink-900/8">
                {plan.days.map((day, dayIndex) => (
                  <section key={`${day.day}-${dayIndex}`} className="px-4 py-4 sm:px-5" aria-label={`Day ${day.day}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="text-[14px] font-bold text-forest-900">
                          Day {day.day}
                          {day.date ? <span className="ml-2 text-[11px] font-normal text-ink-400">{day.date}</span> : null}
                        </h3>
                        <p className="text-[11.5px] text-ink-500">{day.title}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDay(dayIndex)}
                        disabled={plan.days.length <= 1}
                        className="rounded-full p-1.5 text-ink-400 transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-30 print:hidden"
                        aria-label={`Remove day ${day.day}`}
                      >
                        <Trash2 className="size-3.5" aria-hidden />
                      </button>
                    </div>

                    <ul className="mt-2.5 space-y-1.5">
                      {day.activities.map((activity, activityIndex) => (
                        <li
                          key={`${activity.time}-${activityIndex}`}
                          draggable
                          onDragStart={() => setDrag({ day: dayIndex, index: activityIndex })}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={() => {
                            if (drag && drag.day === dayIndex && drag.index !== activityIndex) {
                              moveActivity(dayIndex, drag.index, activityIndex);
                            }
                            setDrag(null);
                          }}
                          className={cn(
                            "group flex items-start gap-2 rounded-lg border border-transparent bg-ivory-50/70 px-2 py-1.5 transition-colors hover:border-ink-900/10",
                            drag?.day === dayIndex && drag.index === activityIndex && "opacity-50",
                          )}
                        >
                          <span className="mt-0.5 cursor-grab text-ink-400 print:hidden" aria-hidden>
                            <GripVertical className="size-3.5" />
                          </span>
                          <span className="w-10 shrink-0 text-[10.5px] font-semibold text-forest-600">
                            {activity.time}
                          </span>
                          <div className="min-w-0 flex-1">
                            <input
                              value={activity.title}
                              onChange={(event) => updateActivity(dayIndex, activityIndex, { title: event.target.value })}
                              aria-label={`Stop title for day ${day.day}`}
                              className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-[12.5px] font-medium text-ink-800 hover:border-ink-900/10 focus:border-forest-400 focus:bg-white focus:outline-none print:border-0"
                            />
                            <div className="flex flex-wrap items-center gap-2 px-1 text-[10.5px] text-ink-400">
                              <span className="inline-flex items-center gap-0.5">
                                <Clock className="size-2.5" aria-hidden />
                                {activity.durationMin} min
                              </span>
                              <span>{activity.kind}</span>
                              {activity.costBdt ? <span>≈ {formatBDT(activity.costBdt)}</span> : <span>free</span>}
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-0.5 print:hidden">
                            <button
                              type="button"
                              onClick={() => moveActivity(dayIndex, activityIndex, activityIndex - 1)}
                              className="rounded p-1 text-ink-400 hover:bg-white hover:text-forest-700"
                              aria-label="Move stop earlier"
                            >
                              <ArrowUp className="size-3" aria-hidden />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveActivity(dayIndex, activityIndex, activityIndex + 1)}
                              className="rounded p-1 text-ink-400 hover:bg-white hover:text-forest-700"
                              aria-label="Move stop later"
                            >
                              <ArrowDown className="size-3" aria-hidden />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeActivity(dayIndex, activityIndex)}
                              className="rounded p-1 text-ink-400 hover:bg-red-50 hover:text-red-700"
                              aria-label="Remove stop"
                            >
                              <X className="size-3" aria-hidden />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-2 print:hidden">
                      {addingDay === dayIndex ? (
                        <div className="rounded-lg border border-forest-100 bg-forest-50/40 p-2.5">
                          <div className="grid gap-2 sm:grid-cols-[auto_1fr]">
                            <input
                              type="time"
                              value={draft.time}
                              onChange={(event) => setDraft({ ...draft, time: event.target.value })}
                              className={inputClass}
                              aria-label="Time"
                            />
                            <input
                              value={draft.title}
                              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                              placeholder="Stop name"
                              className={inputClass}
                              aria-label="Stop name"
                            />
                          </div>
                          <div className="mt-2 grid grid-cols-3 gap-2">
                            <input
                              type="number"
                              min={0}
                              max={720}
                              value={draft.durationMin}
                              onChange={(event) => setDraft({ ...draft, durationMin: Number(event.target.value) })}
                              className={inputClass}
                              aria-label="Duration in minutes"
                            />
                            <input
                              type="number"
                              min={0}
                              step={50}
                              value={draft.costBdt}
                              onChange={(event) => setDraft({ ...draft, costBdt: Number(event.target.value) })}
                              className={inputClass}
                              aria-label="Estimated cost in taka"
                            />
                            <select
                              value={draft.kind}
                              onChange={(event) => setDraft({ ...draft, kind: event.target.value as Activity["kind"] })}
                              className={inputClass}
                              aria-label="Stop type"
                            >
                              <option value="activity">Activity</option>
                              <option value="meal">Meal</option>
                              <option value="travel">Travel</option>
                              <option value="rest">Rest</option>
                              <option value="checkin">Check-in</option>
                            </select>
                          </div>
                          <div className="mt-2 flex gap-2">
                            <button type="button" onClick={() => addActivity(dayIndex)} className="btn btn-primary px-3 py-1.5 text-[11.5px]">
                              Add stop
                            </button>
                            <button type="button" onClick={() => setAddingDay(null)} className="btn btn-ghost px-3 py-1.5 text-[11.5px]">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setAddingDay(dayIndex)}
                          className="inline-flex items-center gap-1 rounded-full border border-dashed border-ink-900/20 px-3 py-1 text-[11px] font-semibold text-ink-500 hover:border-forest-500 hover:text-forest-700"
                        >
                          <Plus className="size-3" aria-hidden /> Add a stop
                        </button>
                      )}
                    </div>
                  </section>
                ))}
              </div>

              <div className="border-t border-ink-900/8 bg-ivory-50/70 px-5 py-4">
                <p className="text-[11.5px] leading-relaxed text-ink-500">{plan.estimateNotice}</p>
                {plan.tips.length ? (
                  <ul className="mt-2 space-y-1">
                    {plan.tips.map((tip) => (
                      <li key={tip} className="flex gap-1.5 text-[11px] leading-relaxed text-ink-500">
                        <span className="mt-1.5 size-1 shrink-0 rounded-full bg-sunset-500" aria-hidden /> {tip}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>

            <div className="card p-5 print:hidden">
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={save} disabled={saving} className="btn btn-primary px-4 py-2 text-[12.5px]">
                  {saving ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <Save className="size-3.5" aria-hidden />}
                  {meta.tripId ? "Update saved trip" : "Save itinerary"}
                </button>
                <button
                  type="button"
                  onClick={toggleShare}
                  disabled={sharing || !meta.tripId}
                  className="btn btn-ghost px-4 py-2 text-[12.5px] disabled:opacity-40"
                >
                  <Share2 className="size-3.5" aria-hidden /> {shareToken ? "Stop sharing" : "Share by link"}
                </button>
                <Link href="/account/trips" className="text-[11.5px] font-semibold text-river-700 underline">
                  My saved trips
                </Link>
              </div>

              {!isAuthed ? (
                <p className="mt-2 text-[11.5px] text-ink-500">
                  <Link href="/login?next=/trip-planner" className="font-semibold text-river-700 underline">
                    Sign in
                  </Link>{" "}
                  to save, share and export itineraries.
                </p>
              ) : null}

              {saveResult?.message ? (
                <div
                  role="status"
                  className={cn(
                    "mt-3 rounded-xl border px-3 py-2.5 text-[12px]",
                    saveResult.ok ? "border-forest-100 bg-forest-50 text-forest-700" : "border-red-200 bg-red-50 text-red-800",
                  )}
                >
                  {saveResult.message}
                  {saveResult.requiresAuth ? (
                    <Link href="/login?next=/trip-planner" className="ml-1 font-semibold underline">
                      Sign in
                    </Link>
                  ) : null}
                  {saveResult.ok && shareToken ? (
                    <>
                      <span className="mt-1 block break-all font-mono text-[10.5px]">
                        {typeof window !== "undefined" ? `${window.location.origin}/trips/${shareToken}` : `/trips/${shareToken}`}
                      </span>
                      <Link href={`/trips/${shareToken}`} className="mt-1 inline-block font-semibold underline">
                        Preview the shared page
                      </Link>
                    </>
                  ) : null}
                </div>
              ) : null}
            </div>

            {plan.sources.length ? (
              <p className="text-[10.5px] leading-relaxed text-ink-400 print:hidden">
                Sources:{" "}
                {plan.sources.map((source, index) => (
                  <span key={source.url}>
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline">
                      {source.label}
                    </a>
                    {index < plan.sources.length - 1 ? ", " : ""}
                  </span>
                ))}
              </p>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
