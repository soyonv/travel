import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const bdt = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

/** Formats an amount in Bangladeshi Taka, e.g. ৳12,500 */
export function formatBDT(amount: number): string {
  if (!Number.isFinite(amount)) return "—";
  return bdt.format(Math.round(amount)).replace(/\u00a0/g, " ");
}

/** Compact currency for cards: ৳12.5k */
export function formatBDTCompact(amount: number): string {
  if (!Number.isFinite(amount)) return "—";
  if (amount >= 100000) return `৳${(amount / 100000).toFixed(amount % 100000 === 0 ? 0 : 1)} lakh`;
  if (amount >= 1000) return `৳${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k`;
  return formatBDT(amount);
}

export function formatDate(value: string | Date | null | undefined, locale = "en-GB"): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateRange(start: string, end: string, locale = "en"): string {
  return `${formatDate(start, locale)} → ${formatDate(end, locale)}`;
}

export function daysBetween(start: string, end: string): number {
  const a = new Date(start);
  const b = new Date(end);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / 86_400_000) + 1);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9\u0980-\u09FF]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function truncate(text: string, max = 160): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

/** Rough reading time in minutes for markdown-ish content. */
export function readingTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

export function isInternalHref(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}

export function absoluteUrl(path = "/"): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://discoverbangladesh.ai";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function toTitleCase(value: string): string {
  return value.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function safeJsonParse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
