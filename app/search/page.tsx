import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Search as SearchIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/filters";
import { EmptyState } from "@/components/ui/primitives";
import { searchAll } from "@/lib/queries";
import { expandQuery, POPULAR_SEARCHES } from "@/lib/search";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

export const metadata: Metadata = {
  title: "Search",
  description: "Search destinations, districts, attractions, guides and travel services across Bangladesh.",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = (params.q ?? "").trim().slice(0, 80);
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  let results = query.length >= 2 ? await searchAll(query) : [];
  let usedAlternative: string | null = null;
  if (query.length >= 2 && results.length === 0) {
    for (const alternative of expandQuery(query)) {
      const attempt = await searchAll(alternative);
      if (attempt.length) {
        results = attempt;
        usedAlternative = alternative;
        break;
      }
    }
  }

  const kinds = Array.from(new Set(results.map((row) => row.kind)));
  const filtered = params.type ? results.filter((row) => row.kind === params.type) : results;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const counts = kinds.map((kind) => ({ kind, count: results.filter((row) => row.kind === kind).length }));

  return (
    <main id="main">
      <PageHeader
        eyebrow="Search"
        title={query ? `Results for “${query}”` : "Search Discover Bangladesh"}
        description="Bangla and English both work. We also try alternate spellings, transliterations and common synonyms when nothing matches."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Search" }]}
      >
        <form action="/search" className="flex max-w-xl items-center gap-2">
          <label htmlFor="global-search" className="sr-only">
            Search
          </label>
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
            <input id="global-search" name="q" defaultValue={query} className="field pl-9" placeholder="Sundarbans, সিলেট, budget…" />
          </div>
          <button type="submit" className="btn btn-primary px-4 py-2.5 text-[13px]">
            Search
          </button>
        </form>
      </PageHeader>

      <div className="page py-8">
        {query.length < 2 ? (
          <div>
            <p className="text-[13px] text-ink-500">Type at least two characters. Try one of these:</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {POPULAR_SEARCHES.map((term) => (
                <Link key={term} href={`/search?q=${encodeURIComponent(term)}`} className="chip text-[12px]">
                  {term}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {query.length >= 2 && filtered.length === 0 ? (
          <EmptyState
            title={`Nothing matched “${query}”`}
            description="Check the spelling, try the other language, or search by district. If you searched for a hotel or operator, the travel directory is a better place to look."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Link href="/districts" className="btn btn-primary px-4 py-2 text-[12.5px]">
                  Browse 64 districts
                </Link>
                <Link href="/packages#directory" className="btn btn-ghost px-4 py-2 text-[12.5px]">
                  Travel directory
                </Link>
              </div>
            }
          />
        ) : null}

        {filtered.length > 0 ? (
          <>
            <p className="text-[12.5px] text-ink-500" aria-live="polite">
              {filtered.length} result{filtered.length === 1 ? "" : "s"}
              {usedAlternative ? (
                <>
                  {" "}
                  — nothing matched exactly, so these results use “{usedAlternative}”.
                </>
              ) : null}
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              <Link href={`/search?q=${encodeURIComponent(query)}`} className="chip text-[11.5px]" data-active={!params.type}>
                All ({results.length})
              </Link>
              {counts.map((entry) => (
                <Link
                  key={entry.kind}
                  href={`/search?q=${encodeURIComponent(query)}&type=${encodeURIComponent(entry.kind)}`}
                  className="chip text-[11.5px]"
                  data-active={params.type === entry.kind}
                >
                  {entry.kind} ({entry.count})
                </Link>
              ))}
            </div>

            <ul className="mt-5 divide-y divide-ink-900/8 overflow-hidden rounded-2xl border border-ink-900/8 bg-white">
              {pageRows.map((row) => (
                <li key={`${row.kind}-${row.href}-${row.title}`}>
                  <Link href={row.href} className="group flex items-start justify-between gap-3 px-4 py-3.5 hover:bg-forest-50/50">
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-[13.5px] font-semibold text-forest-900">{row.title}</span>
                        <span className="rounded-full bg-ivory-100 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.1em] text-ink-500">
                          {row.kind}
                        </span>
                        {row.extra ? <span className="text-[10.5px] text-ink-400">{row.extra}</span> : null}
                      </span>
                      {row.subtitle ? (
                        <span className="mt-0.5 line-clamp-2 block text-[12px] leading-relaxed text-ink-500">{row.subtitle}</span>
                      ) : null}
                    </span>
                    <ArrowRight className="mt-1 size-3.5 shrink-0 text-ink-400 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>

            <Pagination
              basePath="/search"
              page={page}
              totalPages={totalPages}
              params={{ q: query, type: params.type }}
            />

            <div className="mt-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-400">Try also</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {POPULAR_SEARCHES.filter((term) => term.toLowerCase() !== query.toLowerCase())
                  .slice(0, 6)
                  .map((term) => (
                    <Link key={term} href={`/search?q=${encodeURIComponent(term)}`} className="chip text-[11.5px]">
                      {term}
                    </Link>
                  ))}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}
