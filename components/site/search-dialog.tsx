"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Loader2, Search, X } from "lucide-react";
import { useLang } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

type Result = {
  kind: string;
  title: string;
  subtitle: string | null;
  href: string;
  image: string | null;
  extra: string | null;
};

const QUICK_LINKS = [
  { label: "Best places to visit", href: "/destinations" },
  { label: "All 64 districts", href: "/districts" },
  { label: "Sundarbans permits", href: "/travel-guides/sundarbans-permits-and-seasons" },
  { label: "Bangladesh travel budget", href: "/travel-guides/bangladesh-travel-budget" },
  { label: "Trip planner", href: "/trip-planner" },
];

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLang();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 40);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = original;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setError(null);
      setActive(0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const term = query.trim();
    if (term.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Search failed");
        const data = (await response.json()) as { results: Result[] };
        setResults(data.results ?? []);
        setActive(0);
      } catch (fetchError) {
        if ((fetchError as Error).name !== "AbortError") setError("Search is unavailable right now. Please try again.");
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query, open]);

  const grouped = useMemo(() => {
    const map = new Map<string, Result[]>();
    for (const result of results) {
      const list = map.get(result.kind) ?? [];
      list.push(result);
      map.set(result.kind, list);
    }
    return [...map.entries()];
  }, [results]);

  const flat = useMemo(() => grouped.flatMap(([, items]) => items), [grouped]);

  if (!open) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (flat[active]) {
      router.push(flat[active].href);
      onClose();
      return;
    }
    if (query.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((current) => Math.min(current + 1, flat.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => Math.max(current - 1, 0));
    } else if (event.key === "Escape") {
      onClose();
    }
  };

  let cursor = -1;

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label={t("search.title")}>
      <button type="button" className="absolute inset-0 bg-forest-950/55 backdrop-blur-sm" onClick={onClose} tabIndex={-1} aria-label={t("nav.close")} />
      <div className="relative mx-auto mt-[8vh] w-[94%] max-w-2xl">
        <form onSubmit={handleSubmit} className="overflow-hidden rounded-3xl border border-white/40 bg-ivory-50 shadow-2xl">
          <div className="flex items-center gap-3 border-b border-ink-900/10 px-5 py-4">
            <Search className="size-5 text-forest-600" aria-hidden />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder={t("search.placeholder")}
              aria-label={t("search.placeholder")}
              className="w-full bg-transparent text-[16px] text-ink-900 outline-none placeholder:text-ink-400"
              autoComplete="off"
            />
            {loading ? <Loader2 className="size-4 animate-spin text-ink-400" aria-hidden /> : null}
            <button type="button" onClick={onClose} className="rounded-full p-1.5 text-ink-400 hover:bg-ivory-200" aria-label={t("nav.close")}>
              <X className="size-4" aria-hidden />
            </button>
          </div>

          <div className="max-h-[62vh] overflow-y-auto px-2 pb-2 pt-2">
            {query.trim().length < 2 ? (
              <div className="px-3 py-4">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-400">Popular searches</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={onClose}
                      className="chip"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                <p className="mt-5 text-[12px] text-ink-400">{t("search.empty")}</p>
              </div>
            ) : flat.length === 0 && !loading ? (
              <div className="px-4 py-10 text-center">
                <p className="text-sm font-semibold text-forest-900">{t("search.noResults")}</p>
                {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}
                <div className="mt-4 flex justify-center gap-2">
                  <Link href="/destinations" onClick={onClose} className="chip">
                    Browse destinations
                  </Link>
                  <Link href="/districts" onClick={onClose} className="chip">
                    Browse districts
                  </Link>
                </div>
              </div>
            ) : (
              <ul className="space-y-1">
                {grouped.map(([kind, items]) => (
                  <li key={kind}>
                    <p className="px-3 pb-1 pt-2 text-[10.5px] font-bold uppercase tracking-[0.16em] text-ink-400">{kind}</p>
                    <ul>
                      {items.map((item) => {
                        cursor += 1;
                        const index = cursor;
                        return (
                          <li key={`${item.kind}-${item.href}`}>
                            <Link
                              href={item.href}
                              onClick={onClose}
                              onMouseEnter={() => setActive(index)}
                              className={cn(
                                "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
                                active === index ? "bg-forest-800 text-ivory-50" : "hover:bg-ivory-200/70",
                              )}
                            >
                              <span className="relative size-9 shrink-0 overflow-hidden rounded-lg bg-ivory-200">
                                {item.image ? (
                                  <Image src={item.image} alt="" fill sizes="36px" className="object-cover" />
                                ) : null}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className={cn("block truncate text-[13.5px] font-semibold", active === index ? "text-ivory-50" : "text-forest-900")}>
                                  {item.title}
                                </span>
                                <span className={cn("block truncate text-[11.5px]", active === index ? "text-ivory-200/80" : "text-ink-400")}>
                                  {item.subtitle ?? item.extra ?? ""}
                                </span>
                              </span>
                              <ArrowUpRight className={cn("size-3.5 shrink-0", active === index ? "text-ivory-200" : "text-ink-400")} aria-hidden />
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-ink-900/10 bg-white/60 px-5 py-2.5 text-[10.5px] text-ink-400">
            <span>↑↓ to move · Enter to open</span>
            <span>{t("search.hint")}</span>
          </div>
        </form>
      </div>
    </div>
  );
}
