"use client";

import { useMemo, useState } from "react";
import { Calculator, Info, Printer, Wallet } from "lucide-react";
import {
  calculateBudget,
  type AccommodationType,
  type TransportMode,
  type TravelStyle,
} from "@/lib/budget";
import { CURRENCIES, FX_NOTE, formatMoney, type CurrencyCode } from "@/lib/currency";
import { cn } from "@/lib/utils";

const STYLES: { value: TravelStyle; label: string; note: string }[] = [
  { value: "budget", label: "Budget", note: "Hostels, coaches, street food" },
  { value: "standard", label: "Standard", note: "3-star rooms, mixed transport" },
  { value: "premium", label: "Premium", note: "Boutique stays, flights, guides" },
];

const ACCOMMODATION: { value: AccommodationType; label: string }[] = [
  { value: "hostel", label: "Hostel / dorm" },
  { value: "guesthouse", label: "Guesthouse" },
  { value: "hotel", label: "Hotel" },
  { value: "resort", label: "Resort" },
  { value: "luxury", label: "Luxury hotel" },
];

const TRANSPORT: { value: TransportMode; label: string }[] = [
  { value: "bus", label: "Coach" },
  { value: "train", label: "Train" },
  { value: "flight", label: "Flight" },
  { value: "private_car", label: "Private car" },
  { value: "mixed", label: "Mix of modes" },
];

export function BudgetCalculator({
  initialDays = 4,
  initialTravelers = 2,
  initialStyle = "standard",
  destinationName,
}: {
  initialDays?: number;
  initialTravelers?: number;
  initialStyle?: TravelStyle;
  destinationName?: string | null;
}) {
  const [days, setDays] = useState(initialDays);
  const [travelers, setTravelers] = useState(initialTravelers);
  const [style, setStyle] = useState<TravelStyle>(initialStyle);
  const [accommodation, setAccommodation] = useState<AccommodationType>("hotel");
  const [transport, setTransport] = useState<TransportMode>("bus");
  const [includeGuide, setIncludeGuide] = useState(false);
  const [includeBoat, setIncludeBoat] = useState(false);
  const [currency, setCurrency] = useState<CurrencyCode>("BDT");

  const safeDays = Math.min(30, Math.max(1, Math.round(days) || 1));
  const safeTravelers = Math.min(20, Math.max(1, Math.round(travelers) || 1));

  const budget = useMemo(
    () =>
      calculateBudget({
        days: safeDays,
        travelers: safeTravelers,
        style,
        transport,
        accommodation,
        includeGuide,
        includeBoat,
      }),
    [safeDays, safeTravelers, style, transport, accommodation, includeGuide, includeBoat],
  );

  const comparison = useMemo(
    () =>
      STYLES.map((entry) => ({
        ...entry,
        result: calculateBudget({
          days: safeDays,
          travelers: safeTravelers,
          style: entry.value,
          transport,
          accommodation,
          includeGuide,
          includeBoat,
        }),
      })),
    [safeDays, safeTravelers, transport, accommodation, includeGuide, includeBoat],
  );

  return (
    <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
      <form
        className="card h-fit p-5 lg:sticky lg:top-24"
        onSubmit={(event) => event.preventDefault()}
        aria-label="Budget inputs"
      >
        <div className="flex items-center gap-2">
          <Calculator className="size-4 text-forest-600" aria-hidden />
          <h2 className="text-[16px] font-bold text-forest-900">Your trip</h2>
        </div>
        {destinationName ? (
          <p className="mt-1 text-[11.5px] text-ink-400">
            Reference destination: <span className="font-semibold text-forest-700">{destinationName}</span>. The model is
            distance-agnostic, so use the transport line as a sanity check.
          </p>
        ) : null}

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="budget-days" className="label">
              Days
            </label>
            <input
              id="budget-days"
              type="number"
              min={1}
              max={30}
              value={days}
              onChange={(event) => setDays(Number(event.target.value))}
              className="field"
              inputMode="numeric"
            />
          </div>
          <div>
            <label htmlFor="budget-travelers" className="label">
              Travellers
            </label>
            <input
              id="budget-travelers"
              type="number"
              min={1}
              max={20}
              value={travelers}
              onChange={(event) => setTravelers(Number(event.target.value))}
              className="field"
              inputMode="numeric"
            />
          </div>
          <div>
            <label htmlFor="budget-accommodation" className="label">
              Accommodation
            </label>
            <select
              id="budget-accommodation"
              value={accommodation}
              onChange={(event) => setAccommodation(event.target.value as AccommodationType)}
              className="field"
            >
              {ACCOMMODATION.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="budget-transport" className="label">
              Intercity transport
            </label>
            <select
              id="budget-transport"
              value={transport}
              onChange={(event) => setTransport(event.target.value as TransportMode)}
              className="field"
            >
              {TRANSPORT.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="label">Travel style</legend>
          <div className="grid gap-1.5 sm:grid-cols-3">
            {STYLES.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStyle(option.value)}
                aria-pressed={style === option.value}
                className={cn(
                  "rounded-xl border px-2.5 py-2 text-left transition-colors",
                  style === option.value
                    ? "border-forest-600 bg-forest-800 text-ivory-50"
                    : "border-ink-900/10 bg-white text-ink-700 hover:border-forest-400",
                )}
              >
                <span className="block text-[12.5px] font-bold">{option.label}</span>
                <span className={cn("mt-0.5 block text-[10px] leading-tight", style === option.value ? "text-ivory-200/70" : "text-ink-400")}>
                  {option.note}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 space-y-2">
          <label className="flex items-center gap-2 text-[12.5px] text-ink-700">
            <input
              type="checkbox"
              checked={includeGuide}
              onChange={(event) => setIncludeGuide(event.target.checked)}
              className="size-3.5 accent-forest-600"
            />
            Include a local guide ({safeDays} day{safeDays === 1 ? "" : "s"})
          </label>
          <label className="flex items-center gap-2 text-[12.5px] text-ink-700">
            <input
              type="checkbox"
              checked={includeBoat}
              onChange={(event) => setIncludeBoat(event.target.checked)}
              className="size-3.5 accent-forest-600"
            />
            Include one boat excursion
          </label>
        </div>

        <div className="mt-4 border-t border-ink-900/8 pt-3">
          <label htmlFor="budget-currency" className="label">
            Display currency
          </label>
          <select
            id="budget-currency"
            value={currency}
            onChange={(event) => setCurrency(event.target.value as CurrencyCode)}
            className="field"
          >
            {CURRENCIES.map((entry) => (
              <option key={entry.code} value={entry.code}>
                {entry.code} — {entry.label}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-[10.5px] leading-relaxed text-ink-400">{FX_NOTE}</p>
        </div>
      </form>

      <div className="space-y-5">
        <div className="card overflow-hidden">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-ink-900/8 bg-forest-50/60 px-5 py-4">
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-ink-400">
                {STYLES.find((entry) => entry.value === style)?.label} estimate · {safeTravelers} traveller
                {safeTravelers === 1 ? "" : "s"} · {safeDays} day{safeDays === 1 ? "" : "s"}
              </p>
              <p className="display mt-1 text-[2.4rem] leading-none text-forest-900">
                {formatMoney(budget.groupTotal, currency)}
              </p>
              <p className="mt-1 text-[12px] text-ink-500">
                {formatMoney(budget.perPerson, currency)} per person ·{" "}
                {formatMoney(budget.perPersonPerDay, currency)} per person per day
              </p>
            </div>
            <button type="button" onClick={() => window.print()} className="btn btn-ghost px-3.5 py-2 text-[12px] print:hidden">
              <Printer className="size-3.5" aria-hidden /> Print
            </button>
          </div>

          <table className="w-full text-[12.5px]">
            <caption className="sr-only">Estimated cost breakdown</caption>
            <thead>
              <tr className="border-b border-ink-900/8 text-left text-[10.5px] uppercase tracking-[0.12em] text-ink-400">
                <th scope="col" className="px-5 py-2.5 font-semibold">
                  Item
                </th>
                <th scope="col" className="hidden px-3 py-2.5 font-semibold sm:table-cell">
                  Basis
                </th>
                <th scope="col" className="px-5 py-2.5 text-right font-semibold">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {budget.lines.map((line) => (
                <tr key={line.key} className="border-b border-ink-900/5 last:border-0">
                  <th scope="row" className="px-5 py-2 text-left font-semibold text-ink-700">
                    {line.label}
                  </th>
                  <td className="hidden px-3 py-2 text-[11.5px] text-ink-500 sm:table-cell">{line.detail}</td>
                  <td className="px-5 py-2 text-right font-semibold text-forest-900">{formatMoney(line.amount, currency)}</td>
                </tr>
              ))}
              <tr className="bg-forest-50/60">
                <th scope="row" className="px-5 py-2.5 text-left font-bold text-forest-900">
                  Total
                </th>
                <td className="hidden px-3 py-2.5 text-[11.5px] text-ink-500 sm:table-cell">
                  {budget.nights} night{budget.nights === 1 ? "" : "s"} · {Math.ceil(safeTravelers / 2)} room
                  {Math.ceil(safeTravelers / 2) === 1 ? "" : "s"}
                </td>
                <td className="px-5 py-2.5 text-right text-[14px] font-bold text-forest-900">
                  {formatMoney(budget.groupTotal, currency)}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="border-t border-ink-900/8 px-5 py-3.5">
            <p className="flex items-start gap-2 text-[11px] leading-relaxed text-ink-500">
              <Info className="mt-0.5 size-3.5 shrink-0 text-sunset-500" aria-hidden />
              Estimates from our cost model, not a quotation. Accommodation is charged per room (two people sharing), with
              a {budget.contingencyPercent}% contingency for delays and price changes.
            </p>
            <ul className="mt-2 space-y-1">
              {budget.assumptions.map((assumption) => (
                <li key={assumption} className="flex gap-1.5 text-[10.5px] leading-relaxed text-ink-400">
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-ink-400/50" aria-hidden />
                  {assumption}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2">
            <Wallet className="size-4 text-forest-600" aria-hidden />
            <h2 className="text-[15px] font-bold text-forest-900">Compare the three styles</h2>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-[12px]">
              <caption className="sr-only">Budget, standard and premium comparison</caption>
              <thead>
                <tr className="border-b border-ink-900/8 text-left text-[10.5px] uppercase tracking-[0.1em] text-ink-400">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Style
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">
                    Per person
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">
                    Group total
                  </th>
                  <th scope="col" className="py-2 pl-3 text-right font-semibold">
                    Per day
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((entry) => (
                  <tr
                    key={entry.value}
                    className={cn("border-b border-ink-900/5 last:border-0", entry.value === style && "bg-forest-50/70")}
                  >
                    <th scope="row" className="py-2.5 pr-3 text-left font-semibold text-forest-900">
                      {entry.label}
                    </th>
                    <td className="px-3 py-2.5 text-right text-ink-700">{formatMoney(entry.result.perPerson, currency)}</td>
                    <td className="px-3 py-2.5 text-right font-semibold text-ink-900">
                      {formatMoney(entry.result.groupTotal, currency)}
                    </td>
                    <td className="py-2.5 pl-3 text-right text-ink-500">
                      {formatMoney(entry.result.perPersonPerDay, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-ink-400">
            The model changes room class, food, local transport, activity and intercity fare assumptions together. It does
            not check availability, and peak-season surcharges are not included.
          </p>
        </div>
      </div>
    </div>
  );
}
