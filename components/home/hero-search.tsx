"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Search } from "lucide-react";
import { useLang } from "@/components/providers/language-provider";

type Suggestion = { kind: string; title: string; href: string; extra: string | null; subtitle: string | null };

export function HeroSearch() {
  const { t } = useLang();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: controller.signal });
        const data = (await response.json()) as { results: Suggestion[] };
        setSuggestions((data.results ?? []).slice(0, 6));
        setActive(0);
        setOpen(true);
      } catch {
        /* aborted */
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (suggestions[active] && open) {
      router.push(suggestions[active].href);
      return;
    }
    if (query.trim().length >= 2) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <form onSubmit={submit} className="glass flex items-center gap-2 rounded-full p-1.5 shadow-[0_18px_50px_-24px_rgba(7,28,22,0.9)]">
        <Search className="ml-3 size-4 shrink-0 text-forest-700" aria-hidden />
        <label htmlFor="hero-search" className="sr-only">
          {t("search.placeholder")}
        </label>
        <input
          id="hero-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => suggestions.length && setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActive((current) => Math.min(current + 1, suggestions.length - 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive((current) => Math.max(0, current - 1));
            } else if (event.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder={t("home.searchPlaceholder")}
          className="w-full bg-transparent py-2.5 text-[14px] text-ink-900 outline-none placeholder:text-ink-400"
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls="hero-suggestions"
          aria-autocomplete="list"
        />
        {loading ? <Loader2 className="size-4 animate-spin text-ink-400" aria-hidden /> : null}
        <button type="submit" className="btn btn-primary h-10 px-4 text-[13px]">
          {t("action.search")}
        </button>
      </form>

      {open && suggestions.length > 0 ? (
        <ul
          id="hero-suggestions"
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-2xl border border-ink-900/10 bg-white p-1.5 shadow-[var(--shadow-lift)]"
        >
          {suggestions.map((suggestion, index) => (
            <li key={`${suggestion.kind}-${suggestion.href}`} role="option" aria-selected={index === active}>
              <button
                type="button"
                onMouseEnter={() => setActive(index)}
                onClick={() => router.push(suggestion.href)}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left ${
                  index === active ? "bg-forest-800 text-ivory-50" : "text-ink-700 hover:bg-ivory-100"
                }`}
              >
                <MapPin className={`size-3.5 shrink-0 ${index === active ? "text-sunset-400" : "text-forest-500"}`} aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold">{suggestion.title}</span>
                  <span className={`block truncate text-[11px] ${index === active ? "text-ivory-200/70" : "text-ink-400"}`}>
                    {suggestion.extra ?? suggestion.kind}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
