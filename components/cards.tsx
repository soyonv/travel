import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Clock, MapPin, Users } from "lucide-react";
import type { ArticleRow, ExperienceRow, PackageRow } from "@/db/schema";
import type { DestinationWithDistrict } from "@/lib/queries";
import { cn, formatBDT, formatDate, truncate } from "@/lib/utils";

export function DestinationCard({
  destination,
  priority = false,
  className,
  sizes = "(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw",
}: {
  destination: DestinationWithDistrict;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[22px] bg-white ring-1 ring-ink-900/8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {destination.heroImage ? (
          <Image
            src={destination.heroImage}
            alt={`${destination.nameEn} — ${destination.category}`}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
          />
        ) : (
          <div className="absolute inset-0 bg-forest-100" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950/70 via-forest-950/5 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ivory-200/80">{destination.category}</p>
            <h3 className="mt-1 font-sans text-xl font-bold leading-tight text-white">{destination.nameEn}</h3>
            <p className="text-[13px] text-ivory-200/85" lang="bn">
              {destination.nameBn}
            </p>
          </div>
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-transform group-hover:rotate-45">
            <ArrowUpRight className="size-4" aria-hidden />
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="flex items-center gap-1 text-[11.5px] font-medium text-ink-400">
          <MapPin className="size-3" aria-hidden />
          {destination.region}
          {destination.districtName ? <span className="text-ink-400/70">· {destination.districtName}</span> : null}
        </p>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-500">{truncate(destination.summaryEn, 130)}</p>
      </div>
    </Link>
  );
}

export function ArticleCard({ article, className }: { article: ArticleRow; className?: string }) {
  const href = article.type === "guide" ? `/travel-guides/${article.slug}` : `/blog/${article.slug}`;
  return (
    <Link href={href} className={cn("group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-ink-900/8 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]", className)}>
      <div className="relative aspect-[16/10] overflow-hidden">
        {article.heroImage ? (
          <Image src={article.heroImage} alt={article.title} fill sizes="(max-width:768px) 90vw, 30vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 bg-forest-100" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-sunset-600">
          {article.category}
          <span className="size-1 rounded-full bg-ink-400/40" aria-hidden />
          <span className="text-ink-400">{article.type === "guide" ? "Guide" : "Blog"}</span>
        </div>
        <h3 className="mt-2 text-[16px] font-bold leading-snug text-forest-900 group-hover:underline group-hover:decoration-forest-300 group-hover:underline-offset-4">
          {article.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-ink-500">{article.excerpt}</p>
        <p className="mt-auto flex items-center gap-2 pt-3 text-[11px] text-ink-400">
          <Clock className="size-3" aria-hidden /> {article.readingMinutes} min
          <span className="size-1 rounded-full bg-ink-400/40" aria-hidden />
          {formatDate(article.publishedAt)}
        </p>
      </div>
    </Link>
  );
}

export function PackageCard({
  pkg,
  destinationName,
  className,
}: {
  pkg: PackageRow;
  destinationName?: string | null;
  className?: string;
}) {
  return (
    <div className={cn("card flex flex-col overflow-hidden", className)}>
      <div className="relative aspect-[16/9] overflow-hidden">
        {pkg.image ? (
          <Image src={pkg.image} alt={pkg.title} fill sizes="(max-width:768px) 90vw, 33vw" className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-forest-100" />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-ivory-50/95 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-forest-800">
          Trip template
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-ink-400">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3" aria-hidden /> {pkg.durationDays} days
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="size-3" aria-hidden /> {pkg.groupSize}
          </span>
        </div>
        <h3 className="mt-2 text-[16px] font-bold leading-snug text-forest-900">{pkg.title}</h3>
        {destinationName ? <p className="text-[12px] text-ink-400">{destinationName}</p> : null}
        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-ink-500">{pkg.summary}</p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-400">From (estimate)</p>
            <p className="text-lg font-bold text-forest-900">{pkg.priceFromBdt ? formatBDT(pkg.priceFromBdt) : "On request"}</p>
          </div>
          <Link href={`/packages/${pkg.slug}`} className="btn btn-ghost px-3.5 py-2 text-[12px]">
            Details
            <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function DistrictCard({ district }: { district: { slug: string; nameEn: string; nameBn: string; division: string; tagline: string | null; image: string | null } }) {
  return (
    <Link
      href={`/districts/${district.slug}`}
      className="group flex items-start gap-3 rounded-xl border border-ink-900/8 bg-white px-3.5 py-3 transition-all hover:border-forest-400 hover:shadow-sm"
    >
      <span className="relative mt-0.5 size-11 shrink-0 overflow-hidden rounded-lg bg-forest-100">
        {district.image ? <Image src={district.image} alt="" fill sizes="44px" className="object-cover" /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] font-semibold text-forest-900">{district.nameEn}</span>
        <span className="block truncate text-[12px] text-ink-400" lang="bn">
          {district.nameBn}
        </span>
        <span className="mt-0.5 block truncate text-[11px] text-ink-400">{district.division} Division</span>
      </span>
      <ArrowUpRight className="mt-1 size-3.5 shrink-0 text-ink-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
    </Link>
  );
}

export function ExperienceTile({ experience }: { experience: ExperienceRow }) {
  return (
    <Link
      href={`/experiences#${experience.slug}`}
      className="group relative flex h-[220px] w-[260px] shrink-0 flex-col justify-end overflow-hidden rounded-2xl sm:w-[280px]"
    >
      {experience.image ? (
        <Image
          src={experience.image}
          alt={experience.nameEn}
          fill
          sizes="280px"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-forest-800" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-forest-950/85 via-forest-950/25 to-transparent" />
      <div className="relative p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sunset-400">Experience</p>
        <h3 className="mt-1 text-[15px] font-bold leading-tight text-white">{experience.nameEn}</h3>
        <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-ivory-200/75">{experience.summary}</p>
      </div>
    </Link>
  );
}
