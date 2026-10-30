/**
 * Indicative display rates only. These are NOT live rates and must never be
 * used to take payment. The last-reviewed date is shown wherever they appear.
 */
export const FX_REVIEWED_AT = "2026-10-01";

export const CURRENCIES = [
  { code: "BDT", label: "Bangladeshi Taka", symbol: "৳", perBdt: 1 },
  { code: "USD", label: "US Dollar", symbol: "$", perBdt: 1 / 122 },
  { code: "EUR", label: "Euro", symbol: "€", perBdt: 1 / 133 },
  { code: "GBP", label: "Pound Sterling", symbol: "£", perBdt: 1 / 158 },
  { code: "INR", label: "Indian Rupee", symbol: "₹", perBdt: 1 / 1.45 },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export function isCurrencyCode(value: string | undefined): value is CurrencyCode {
  return Boolean(CURRENCIES.find((currency) => currency.code === value));
}

export function convertFromBdt(amountBdt: number, code: CurrencyCode): number {
  const currency = CURRENCIES.find((entry) => entry.code === code) ?? CURRENCIES[0];
  return amountBdt * currency.perBdt;
}

export function formatMoney(amountBdt: number, code: CurrencyCode = "BDT"): string {
  const numeric = Number.isFinite(amountBdt) ? amountBdt : 0;
  const converted = convertFromBdt(numeric, code);
  const maximumFractionDigits = code === "BDT" || converted >= 1000 ? 0 : 2;
  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
    minimumFractionDigits: code === "BDT" ? 0 : converted < 100 ? 2 : 0,
  }).format(Math.round(converted * 100) / 100);
  if (code === "BDT") return `৳${formatted}`;
  const symbol = CURRENCIES.find((entry) => entry.code === code)?.symbol ?? "";
  return `${symbol}${formatted}`;
}

export const FX_NOTE = `Indicative conversion at a fixed reference rate reviewed ${FX_REVIEWED_AT}. Not a live rate and not a payment quote. All prices on this site are modelled in BDT.`;
