import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { ArticleCard } from "@/components/cards";
import { FilterLinks, Pagination } from "@/components/filters";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/ui/primitives";
import { getDbOrNull } from "@/lib/db";
import { getArticleFacets, getArticles } from "@/lib/queries";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 6;

export const metadata: Metadata = {
  title: "Bangladesh travel guides — budgets, transport, safety and itineraries",
  description:
    "Practical Bangladesh travel guides: what a trip costs, how to get around, permits for the Sundarbans, first-time itineraries and staying safe and well.",
  alternates: { canonical: "/travel-guides" },
  openGraph: { title: "Bangladesh travel guides", url: absoluteUrl("/travel-guides") },
};

export default async function TravelGuidesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const db = await getDbOrNull();
  if (!db) {
    return (
      <main id="main">
        <PageHeader eyebrow="Guides" title="Travel guides" breadcrumbs={[{ label: "Home", href: "/" }, { label: "Guides" }]} />
        <div className="page py-10">
          <EmptyState title="The database is not connected" description="Apply the migration and seed data, then reload." />
        </div>
      </main>
    );
  }

  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const [articles, facets] = await Promise.all([
    getArticles(db, { type: "guide", category: params.category, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
    getArticleFacets(db),
  ]);
  const guideCategories = facets
    .filter((facet) => facet.type === "guide")
    .map((facet) => ({ value: facet.category, count: facet.count }));
  const guideTotal = facets.filter((facet) => facet.type === "guide").reduce((sum, facet) => sum + facet.count, 0);
  const totalPages = Math.max(1, Math.ceil(guideTotal / PAGE_SIZE));

  return (
    <main id="main">
      <PageHeader
        eyebrow="Read before you go"
        title="Travel guides"
        description="Long-form, practical writing about money, transport, permits, safety and the small decisions that make a trip work. Estimates are labelled as estimates."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Travel guides" }]}
      >
        <div className="flex flex-wrap gap-2">
          <Link href="/blog" className="btn btn-ghost px-4 py-2 text-[12.5px]">
            Travel blog <ArrowRight className="size-3.5" aria-hidden />
          </Link>
          <Link href="/ai-travel-agent" className="btn btn-primary px-4 py-2 text-[12.5px]">
            Ask the AI agent
          </Link>
        </div>
      </PageHeader>

      <div className="page py-8">
        <FilterLinks
          basePath="/travel-guides"
          param="category"
          allLabel={`All ${guideTotal} guides`}
          current={params.category}
          options={guideCategories}
        />

        {articles.length ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <EmptyState
              title="No guides in that category yet"
              description="Browse all guides, or read the blog for shorter field notes."
              action={
                <Link href="/travel-guides" className="btn btn-primary px-4 py-2 text-[13px]">
                  All guides
                </Link>
              }
            />
          </div>
        )}

        <Pagination basePath="/travel-guides" page={page} totalPages={totalPages} params={{ category: params.category }} />

        <aside className="mt-10 flex items-start gap-3 rounded-2xl border border-forest-100 bg-forest-50 px-4 py-4">
          <BookOpen className="mt-0.5 size-4 shrink-0 text-forest-600" aria-hidden />
          <p className="text-[12px] leading-relaxed text-forest-700">
            These guides are editorial seed content with sources listed inside each piece. If you spot something out of
            date, use the{" "}
            <Link href="/contact" className="font-semibold underline">
              correction form
            </Link>{" "}
            — accuracy matters more than volume.
          </p>
        </aside>
      </div>
    </main>
  );
}
