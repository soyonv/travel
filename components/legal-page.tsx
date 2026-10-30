import type { ReactNode } from "react";
import { PageHeader } from "@/components/page-header";
import { cn } from "@/lib/utils";

export type PolicySection = { id: string; heading: string; body: ReactNode };

export function LegalPage({
  eyebrow,
  title,
  description,
  updated,
  sections,
  aside,
}: {
  eyebrow: string;
  title: string;
  description: string;
  updated: string;
  sections: PolicySection[];
  aside?: ReactNode;
}) {
  return (
    <main id="main">
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: title }]}
      >
        <p className="text-[11px] text-ink-400">Last updated {updated}</p>
      </PageHeader>

      <div className={cn("page grid gap-8 py-9", aside ? "lg:grid-cols-[1fr_280px]" : "")}>
        <div className="max-w-3xl">
          <nav aria-label="On this page" className="mb-6 rounded-xl border border-ink-900/8 bg-white px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400">On this page</p>
            <ol className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
              {sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="text-[11.5px] text-river-700 underline decoration-river-300 underline-offset-2">
                    {section.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="space-y-8">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="text-[19px] font-bold text-forest-900">{section.heading}</h2>
                <div className="prose-editorial mt-2 text-[14.5px]">{section.body}</div>
              </section>
            ))}
          </div>
        </div>

        {aside ? <aside className="space-y-4">{aside}</aside> : null}
      </div>
    </main>
  );
}
