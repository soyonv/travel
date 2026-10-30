import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock, ShieldCheck } from "lucide-react";
import type { ArticleRow } from "@/db/schema";
import { ArticleCard } from "@/components/cards";
import { SaveButton } from "@/components/account/save-button";
import { Breadcrumbs } from "@/components/ui/primitives";
import { Markdown } from "@/components/ui/markdown";
import { formatDate } from "@/lib/utils";

export function ArticleDetail({
  article,
  related,
  basePath,
  baseLabel,
  initiallySaved = false,
}: {
  article: ArticleRow;
  related: ArticleRow[];
  basePath: string;
  baseLabel: string;
  initiallySaved?: boolean;
}) {
  return (
    <main id="main">
      <article className="page pt-6">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: baseLabel, href: basePath }, { label: article.title }]}
        />

        <div className="mx-auto max-w-3xl">
          <p className="eyebrow mb-2.5">{article.category}</p>
          <h1 className="display text-[clamp(2rem,4.4vw,3.3rem)] text-forest-900">{article.title}</h1>
          {article.titleBn ? (
            <p className="mt-2 text-[15px] text-ink-400" lang="bn">
              {article.titleBn}
            </p>
          ) : null}
          <p className="mt-3 text-[16px] leading-relaxed text-ink-500">{article.excerpt}</p>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11.5px] text-ink-400">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5" aria-hidden /> {formatDate(article.publishedAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden /> {article.readingMinutes} min read
            </span>
            <span>By {article.author}</span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <SaveButton id={article.id} kind="article" label="Save guide" initialSaved={initiallySaved} />
            {article.tags?.length ? (
              <ul className="flex flex-wrap gap-1.5">
                {article.tags.slice(0, 5).map((tag) => (
                  <li key={tag} className="rounded-full bg-ivory-100 px-2.5 py-1 text-[10.5px] font-medium text-ink-500">
                    {tag}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        {article.heroImage ? (
          <div className="relative mx-auto mt-7 aspect-[16/9] max-w-4xl overflow-hidden rounded-3xl bg-forest-100">
            <Image
              src={article.heroImage}
              alt={article.title}
              fill
              priority
              sizes="(max-width:1024px) 100vw, 900px"
              className="object-cover"
            />
          </div>
        ) : null}

        <div className="mx-auto mt-8 max-w-3xl">
          <Markdown content={article.bodyMd} className="prose-editorial" />

          <div className="mt-8 flex items-start gap-2 rounded-xl border border-forest-100 bg-forest-50 px-3.5 py-3 text-[11.5px] leading-relaxed text-forest-700">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            Editorial note: prices and schedules in this piece are planning estimates unless a source is linked. Verify
            with the operator or official authority before you travel or pay a deposit.
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-ink-900/8 pt-5">
            <Link href={basePath} className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-river-700 hover:underline">
              <ArrowLeft className="size-3.5" aria-hidden /> Back to {baseLabel.toLowerCase()}
            </Link>
            <Link href="/ai-travel-agent" className="btn btn-ghost px-4 py-2 text-[12px]">
              Ask a question about this
            </Link>
          </div>
        </div>

        {related.length ? (
          <section className="mx-auto mt-12 max-w-5xl border-t border-ink-900/8 pt-8" aria-labelledby="related-reading">
            <h2 id="related-reading" className="display text-[1.6rem] text-forest-900">
              Related reading
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ArticleCard key={item.id} article={item} />
              ))}
            </div>
          </section>
        ) : null}
      </article>
      <div className="pb-16" />
    </main>
  );
}
