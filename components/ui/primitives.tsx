import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight, Database, Info, ShieldCheck, Sprout } from "lucide-react";
import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "forest" | "sunset" | "river" | "outline";
  className?: string;
}) {
  const tones = {
    neutral: "bg-ivory-200 text-ink-700",
    forest: "bg-forest-100 text-forest-800",
    sunset: "bg-sunset-100 text-sunset-600",
    river: "bg-river-100 text-river-700",
    outline: "border border-ink-900/15 text-ink-500",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  tone = "light",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center sm:text-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? (
          <p className={cn("eyebrow mb-2.5", tone === "dark" && "text-sunset-400")}>{eyebrow}</p>
        ) : null}
        <h2
          className={cn(
            "display text-[clamp(1.85rem,3.6vw,2.85rem)]",
            tone === "dark" ? "text-ivory-50" : "text-forest-900",
          )}
        >
          {title}
        </h2>
        {description ? (
          <p className={cn("mt-3 text-[15px] leading-relaxed", tone === "dark" ? "text-ivory-200/80" : "text-ink-500")}>
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1.5 text-xs text-ink-400">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
          {index > 0 ? <ChevronRight className="size-3 opacity-60" aria-hidden /> : null}
          {item.href ? (
            <Link href={item.href} className="rounded transition-colors hover:text-forest-700">
              {item.label}
            </Link>
          ) : (
            <span className="text-ink-500">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function SetupRequired({ feature }: { feature: string }) {
  return (
    <div className="mx-auto my-16 max-w-xl">
      <div className="card p-7">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-sunset-100 px-3 py-1 text-xs font-bold text-sunset-600">
          <Database className="size-3.5" aria-hidden /> Setup required
        </span>
        <h1 className="text-2xl font-bold text-forest-900">The database isn&apos;t connected yet</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-500">
          {feature} reads live records from Cloudflare D1. Apply the schema and seed data, then reload this page.
        </p>
        <ol className="mt-5 space-y-2 text-sm text-ink-700">
          <li>
            <code className="rounded bg-ivory-100 px-1.5 py-0.5">npm run db:migrate:local</code> — create the tables
          </li>
          <li>
            <code className="rounded bg-ivory-100 px-1.5 py-0.5">npm run db:seed:local</code> — load the destinations, districts and guides
          </li>
          <li>
            Check <Link href="/api/health" className="text-river-700 underline">/api/health</Link> to confirm the binding
          </li>
        </ol>
        <p className="mt-5 text-xs text-ink-400">
          In production, add a D1 binding named <code>DB</code> and run the migration against the deployed database.
        </p>
      </div>
    </div>
  );
}

export function ConfidenceNote({
  kind = "seed",
  className,
}: {
  kind?: "seed" | "directory" | "estimate" | "verified";
  className?: string;
}) {
  const config = {
    seed: {
      icon: Sprout,
      text: "Editorial seed content — sources listed below. Confirm details before travelling.",
      tone: "bg-forest-50 text-forest-700 border-forest-100",
    },
    directory: {
      icon: Info,
      text: "Directory listing, not a booking partner. Rates and availability are unverified.",
      tone: "bg-ivory-100 text-ink-500 border-ivory-200",
    },
    estimate: {
      icon: Info,
      text: "Estimate from our cost model, not a quotation or availability check.",
      tone: "bg-sunset-100/60 text-sunset-600 border-sunset-100",
    },
    verified: {
      icon: ShieldCheck,
      text: "Verified against an official source.",
      tone: "bg-forest-100 text-forest-800 border-forest-100",
    },
  } as const;
  const { icon: Icon, text, tone } = config[kind];
  return (
    <p className={cn("flex items-start gap-2 rounded-xl border px-3 py-2.5 text-[12px] leading-relaxed", tone, className)}>
      <Icon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      <span>{text}</span>
    </p>
  );
}

export function SourceList({ sources }: { sources?: { label: string; url: string }[] | null }) {
  if (!sources?.length) return null;
  return (
    <div className="mt-5">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-400">Sources</p>
      <ul className="space-y-1.5">
        {sources.map((source) => (
          <li key={source.url}>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-river-700 underline decoration-river-400/40 underline-offset-2 hover:decoration-river-600"
            >
              {source.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-ink-900/15 bg-white/60 px-6 py-12 text-center">
      <p className="text-base font-semibold text-forest-900">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="display text-3xl text-forest-900 sm:text-4xl">{value}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-ink-400">{label}</p>
    </div>
  );
}
