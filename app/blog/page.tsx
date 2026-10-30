import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, PenLine } from "lucide-react";
import { ArticleCard } from "@/components/cards";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/ui/primitives";
import { getDbOrNull } from "@/lib/db";
import { getArticles } from "@/lib/queries";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The travel blog — field notes from Bangladesh",
  description:
    "Short, honest writing about travelling in Bangladesh: old Dhaka food, monsoon planning and responsible travel in the hill districts.",
  alternates: { canonical: "/blog" },
  openGraph: { title: "The Discover Bangladesh travel blog", url: absoluteUrl("/blog") },
};

export default async function BlogPage() {
  const db = await getDbOrNull();
  if (!db) {
    return (
      <main id="main">
        <PageHeader eyebrow="Field notes" title="Travel blog" breadcrumbs={[{ label: "Home", href: "/" }, { label: "Blog" }]} />
        <div className="page py-10">
          <EmptyState title="The database is not connected" description="Apply the migration and seed data, then reload." />
        </div>
      </main>
    );
  }

  const posts = await getArticles(db, { type: "blog", limit: 24 });
  const guides = await getArticles(db, { type: "guide", limit: 3 });

  return (
    <main id="main">
      <PageHeader
        eyebrow="From the road"
        title="Travel blog"
        description="Shorter pieces than the guides: observations, food, seasonality and the ethics of moving through other people's homes."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Blog" }]}
      >
        <Link href="/travel-guides" className="btn btn-ghost px-4 py-2 text-[12.5px]">
          Long-form travel guides <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </PageHeader>

      <div className="page py-8">
        {posts.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <ArticleCard key={post.id} article={post} />
            ))}
          </div>
        ) : (
          <EmptyState title="No posts yet" description="The editorial team is working on the first field notes." />
        )}

        <section className="mt-12 border-t border-ink-900/8 pt-8" aria-labelledby="guides-from-blog">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow mb-1.5">Go deeper</p>
              <h2 id="guides-from-blog" className="display text-[1.7rem] text-forest-900">
                Practical guides
              </h2>
            </div>
            <Link href="/travel-guides" className="text-[12px] font-semibold text-river-700 hover:underline">
              All guides
            </Link>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <ArticleCard key={guide.id} article={guide} />
            ))}
          </div>
        </section>

        <aside className="mt-10 flex items-start gap-3 rounded-2xl border border-ink-900/8 bg-white px-4 py-4">
          <PenLine className="mt-0.5 size-4 shrink-0 text-forest-600" aria-hidden />
          <p className="text-[12px] leading-relaxed text-ink-500">
            We do not publish paid placements or invented reviews. If a business is mentioned, it is because an editor used
            it, and any commercial relationship is disclosed in the{" "}
            <Link href="/affiliate-disclosure" className="font-semibold text-river-700 underline">
              affiliate disclosure
            </Link>
            .
          </p>
        </aside>
      </div>
    </main>
  );
}
