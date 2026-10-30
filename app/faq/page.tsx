import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/ui/primitives";
import { getDbOrNull } from "@/lib/db";
import { getFaqs } from "@/lib/queries";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Frequently asked questions about travelling in Bangladesh",
  description:
    "Honest answers about budgets, permits, the Sundarbans season, safety, solo and family travel, the AI agent and how this site makes money.",
  alternates: { canonical: "/faq" },
  openGraph: { title: "Bangladesh travel FAQ", url: absoluteUrl("/faq") },
};

export default async function FaqPage() {
  const db = await getDbOrNull();
  const rows = db ? await getFaqs(db).catch(() => []) : [];

  const categories = Array.from(new Set(rows.map((row) => row.category)));
  const jsonLd = rows.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: rows.map((row) => ({
          "@type": "Question",
          name: row.question,
          acceptedAnswer: { "@type": "Answer", text: row.answer },
        })),
      }
    : null;

  return (
    <main id="main">
      {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /> : null}
      <PageHeader
        eyebrow="Straight answers"
        title="Frequently asked questions"
        description="Budget, permits, seasons, safety and how the AI actually works. If an answer depends on an official decision, we point to the authority instead of guessing."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "FAQ" }]}
      >
        <div className="flex flex-wrap gap-2">
          <Link href="/contact" className="btn btn-primary px-4 py-2 text-[12.5px]">
            Ask something else
          </Link>
          <Link href="/travel-guides" className="btn btn-ghost px-4 py-2 text-[12.5px]">
            Read the guides
          </Link>
        </div>
      </PageHeader>

      <div className="page py-9">
        {rows.length ? (
          <div className="mx-auto max-w-3xl space-y-8">
            {categories.map((category) => (
              <section key={category} aria-labelledby={`faq-${category}`}>
                <h2 id={`faq-${category}`} className="flex items-center gap-2 text-[15px] font-bold text-forest-900">
                  <HelpCircle className="size-4 text-forest-600" aria-hidden />
                  {category}
                </h2>
                <div className="mt-2 divide-y divide-ink-900/8 overflow-hidden rounded-2xl border border-ink-900/8 bg-white">
                  {rows
                    .filter((row) => row.category === category)
                    .map((row) => (
                      <details key={row.id} className="group px-4 py-3">
                        <summary className="cursor-pointer list-none text-[13.5px] font-semibold text-forest-900 marker:hidden">
                          <span className="flex items-start justify-between gap-3">
                            {row.question}
                            <span className="mt-0.5 shrink-0 text-ink-400 transition-transform group-open:rotate-45" aria-hidden>
                              +
                            </span>
                          </span>
                        </summary>
                        <p className="mt-2 text-[12.5px] leading-relaxed text-ink-600">{row.answer}</p>
                      </details>
                    ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <EmptyState
            title="The FAQ is not available"
            description="The database is not connected, so answers cannot be loaded. The travel guides and contact form still work."
            action={
              <Link href="/travel-guides" className="btn btn-primary px-4 py-2 text-[12.5px]">
                Read the guides
              </Link>
            }
          />
        )}

        <p className="mx-auto mt-8 max-w-3xl rounded-xl border border-sunset-100 bg-sunset-100/40 px-4 py-3 text-[11px] leading-relaxed text-ink-600">
          Answers here are editorial guidance, not legal, medical or immigration advice. Rules for protected areas, islands and
          hill districts are set by authorities and can change at short notice — verify with the authority before you travel.
        </p>
      </div>
    </main>
  );
}
