import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { LogoOnDark } from "@/components/brand/logo";
import { NewsletterForm } from "@/components/site/newsletter-form";
import { t, type Lang } from "@/lib/i18n";

const columns: { titleKey: "footer.explore" | "footer.company" | "footer.legal"; links: { href: string; label: string }[] }[] = [
  {
    titleKey: "footer.explore",
    links: [
      { href: "/destinations", label: "Destinations" },
      { href: "/districts", label: "64 districts" },
      { href: "/experiences", label: "Experiences" },
      { href: "/packages", label: "Trip templates" },
      { href: "/map", label: "Map explorer" },
      { href: "/budget-calculator", label: "Budget calculator" },
      { href: "/ai-travel-agent", label: "AI travel agent" },
    ],
  },
  {
    titleKey: "footer.company",
    links: [
      { href: "/about", label: "About us" },
      { href: "/contact", label: "Contact" },
      { href: "/blog", label: "Travel blog" },
      { href: "/travel-guides", label: "Travel guides" },
      { href: "/faq", label: "FAQ" },
      { href: "/partners", label: "Partner with us" },
    ],
  },
  {
    titleKey: "footer.legal",
    links: [
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of service" },
      { href: "/cookies", label: "Cookie preferences" },
      { href: "/editorial-policy", label: "Editorial policy" },
      { href: "/responsible-tourism", label: "Responsible tourism" },
      { href: "/affiliate-disclosure", label: "Affiliate disclosure" },
    ],
  },
];

export function Footer({ lang }: { lang: Lang }) {
  const year = new Date().getFullYear();
  return (
    <footer data-print-hide="true" className="mt-24 bg-forest-950 text-ivory-100">
      <div className="page py-14">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1.85fr]">
          <div>
            <LogoOnDark />
            <p className="mt-5 max-w-sm text-[13.5px] leading-relaxed text-ivory-200/70">
              An independent, bilingual travel platform for Bangladesh. Destination pages, district guides and AI trip
              planning grounded in published sources — not in paid placement.
            </p>
            <div className="mt-6 max-w-md">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sunset-400">{t(lang, "home.newsletter")}</p>
              <p className="mt-2 text-[13px] text-ivory-200/70">{t(lang, "home.newsletterSub")}</p>
              <div className="mt-3">
                <NewsletterForm />
              </div>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.titleKey}>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sunset-400">{t(lang, column.titleKey)}</p>
                <ul className="mt-3 space-y-2">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-[13px] text-ivory-200/75 transition-colors hover:text-ivory-50"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ivory-200/50">Official sources we link to</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-[12px]">
              {[
                { label: "Bangladesh Tourism Board", href: "https://tourismboard.gov.bd/" },
                { label: "Beautiful Bangladesh", href: "https://beautifulbangladesh.gov.bd/" },
                { label: "Forest Department", href: "https://bforest.gov.bd/" },
                { label: "Bangladesh Railway", href: "https://railway.gov.bd/" },
                { label: "BMD weather", href: "https://bmd.gov.bd/" },
              ].map((source) => (
                <a
                  key={source.href}
                  href={source.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-ivory-200/75 underline decoration-white/20 underline-offset-2 hover:text-ivory-50"
                >
                  {source.label}
                  <ExternalLink className="size-3" aria-hidden />
                </a>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ivory-200/50">Read this first</p>
            <p className="mt-2 text-[12px] leading-relaxed text-ivory-200/70">
              {t(lang, "footer.disclaimer")}
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-[12px] text-ivory-200/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} Discover Bangladesh AI. {t(lang, "footer.rights")}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/editorial-policy" className="hover:text-ivory-50">
              How we work
            </Link>
            <Link href="/responsible-tourism" className="hover:text-ivory-50">
              Travel responsibly
            </Link>
            <Link href="/admin" className="inline-flex items-center gap-1 hover:text-ivory-50">
              Admin <ArrowUpRight className="size-3" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
