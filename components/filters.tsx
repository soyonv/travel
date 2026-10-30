import Link from "next/link";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

/** Renders filter chips that preserve the other query parameters. */
export function FilterLinks({
  basePath,
  param,
  options,
  current,
  allLabel = "All",
  className,
  params,
}: {
  basePath: string;
  param: string;
  options: { value: string; label?: string; count?: number }[];
  current?: string;
  allLabel?: string;
  className?: string;
  params?: Record<string, string | undefined>;
}) {
  const href = (value?: string) => {
    const search = new URLSearchParams();
    for (const [key, entry] of Object.entries(params ?? {})) {
      if (entry) search.set(key, entry);
    }
    if (value) search.set(param, value);
    const query = search.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)} aria-label="Filters">
      <SlidersHorizontal className="mr-1 size-3.5 text-ink-400" aria-hidden />
      <Link href={href()} className="chip text-[11.5px]" data-active={!current}>
        {allLabel}
      </Link>
      {options.map((option) => (
        <Link
          key={option.value}
          href={href(option.value)}
          className="chip text-[11.5px]"
          data-active={current === option.value}
          aria-current={current === option.value ? "true" : undefined}
        >
          {option.label ?? option.value}
          {typeof option.count === "number" ? (
            <span className="text-[10px] opacity-60">{option.count}</span>
          ) : null}
        </Link>
      ))}
    </div>
  );
}

export function Pagination({
  basePath,
  page,
  totalPages,
  params,
}: {
  basePath: string;
  page: number;
  totalPages: number;
  params?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const href = (target: number) => {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params ?? {})) {
      if (value) search.set(key, value);
    }
    if (target > 1) search.set("page", String(target));
    const query = search.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-between gap-3 border-t border-ink-900/8 pt-5">
      <p className="text-[12.5px] text-ink-400">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link href={href(page - 1)} className="btn btn-ghost px-3.5 py-2 text-[12.5px]">
            <ChevronLeft className="size-3.5" aria-hidden /> Previous
          </Link>
        ) : null}
        {page < totalPages ? (
          <Link href={href(page + 1)} className="btn btn-ghost px-3.5 py-2 text-[12.5px]">
            Next <ChevronRight className="size-3.5" aria-hidden />
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
