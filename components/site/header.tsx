"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Compass,
  Languages,
  Map,
  Menu,
  Search,
  Sparkles,
  User,
  Wallet,
  X,
  HelpCircle,
  Mountain,
  BookOpen,
  TreePalm,
  Camera,
  Users,
  ArrowRight,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { useLang } from "@/components/providers/language-provider";
import { SearchDialog } from "@/components/site/search-dialog";
import { cn } from "@/lib/utils";

const primaryNav = [
  { href: "/destinations", key: "nav.destinations" as const },
  { href: "/districts", key: "nav.districts" as const },
];

const experienceLinks = [
  { href: "/experiences#beach-escapes", label: "Beach & islands", icon: TreePalm },
  { href: "/experiences#hill-adventures", label: "Hills & adventure", icon: Mountain },
  { href: "/experiences#historical-exploration", label: "History & heritage", icon: BookOpen },
  { href: "/experiences#food-tourism", label: "Food & culture", icon: Camera },
  { href: "/experiences#family-holidays", label: "Family travel", icon: Users },
  { href: "/experiences#budget-travel", label: "Budget travel", icon: Wallet },
];

const moreLinks = [
  { href: "/travel-guides", key: "nav.guides" as const },
  { href: "/blog", key: "nav.blog" as const },
  { href: "/map", key: "nav.map" as const },
  { href: "/budget-calculator", key: "nav.budget" as const },
  { href: "/about", key: "nav.about" as const },
  { href: "/faq", label: "FAQ" },
];

export function Header({ isAuthed = false, isAdmin = false }: { isAuthed?: boolean; isAdmin?: boolean }) {
  const { t, lang, setLang } = useLang();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<"explore" | "more" | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!openMenu) return;
    const onClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpenMenu(null);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [openMenu]);

  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href));

  const linkClass = (href: string) =>
    cn(
      "rounded-full px-3 py-2 text-[13.5px] font-semibold transition-colors",
      isActive(href) ? "bg-forest-50 text-forest-800" : "text-ink-700 hover:bg-forest-50/70 hover:text-forest-800",
    );

  return (
    <>
      <header
        data-print-hide="true"
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          scrolled ? "glass shadow-[0_8px_30px_-24px_rgba(7,28,22,0.55)]" : "bg-ivory-50/95 backdrop-blur-sm",
        )}
      >
        <div className="page flex h-[68px] items-center justify-between gap-3">
          <Link href="/" aria-label="Discover Bangladesh AI — home" className="rounded-lg">
            <Logo compact />
          </Link>

          <div ref={menuRef} className="hidden items-center gap-0.5 lg:flex">
            <Link href="/" className={linkClass("/")}>
              {t("nav.home")}
            </Link>
            {primaryNav.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass(item.href)}>
                {t(item.key)}
              </Link>
            ))}

            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenMenu(openMenu === "explore" ? null : "explore")}
                aria-expanded={openMenu === "explore"}
                aria-haspopup="true"
                className={cn(linkClass("/experiences"), "inline-flex items-center gap-1")}
              >
                {t("nav.experiences")}
                <ChevronDown className={cn("size-3.5 transition-transform", openMenu === "explore" && "rotate-180")} aria-hidden />
              </button>
              {openMenu === "explore" ? (
                <div className="absolute left-0 top-full z-50 mt-2 w-[420px] rounded-2xl border border-ink-900/10 bg-white p-3 shadow-[var(--shadow-lift)]">
                  <div className="grid grid-cols-2 gap-1">
                    {experienceLinks.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="group flex items-start gap-2.5 rounded-xl px-3 py-2.5 transition-colors hover:bg-forest-50"
                      >
                        <item.icon className="mt-0.5 size-4 text-forest-600" aria-hidden />
                        <span className="text-[13px] font-semibold text-ink-700 group-hover:text-forest-900">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="/experiences"
                    className="mt-2 flex items-center justify-between rounded-xl bg-forest-900 px-3.5 py-2.5 text-[13px] font-semibold text-ivory-50"
                  >
                    All 13 experiences <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                </div>
              ) : null}
            </div>

            <Link href="/trip-planner" className={linkClass("/trip-planner")}>
              {t("nav.aiPlanner")}
            </Link>
            <Link href="/packages" className={linkClass("/packages")}>
              {t("nav.packages")}
            </Link>

            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenMenu(openMenu === "more" ? null : "more")}
                aria-expanded={openMenu === "more"}
                aria-haspopup="true"
                className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-[13.5px] font-semibold text-ink-700 transition-colors hover:bg-forest-50/70 hover:text-forest-800"
              >
                More
                <ChevronDown className={cn("size-3.5 transition-transform", openMenu === "more" && "rotate-180")} aria-hidden />
              </button>
              {openMenu === "more" ? (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-ink-900/10 bg-white p-2 shadow-[var(--shadow-lift)]">
                  {moreLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium text-ink-700 hover:bg-forest-50"
                    >
                      <span className="size-1 rounded-full bg-forest-400" aria-hidden />
                      {"key" in item && item.key ? t(item.key) : item.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div
              className="hidden items-center rounded-full border border-ink-900/10 bg-white/70 p-0.5 md:flex"
              role="group"
              aria-label={t("nav.language")}
            >
              <Languages className="ml-2 size-3.5 text-ink-400" aria-hidden />
              {(["en", "bn"] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLang(code)}
                  aria-pressed={lang === code}
                  lang={code}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11.5px] font-bold transition-colors",
                    lang === code ? "bg-forest-800 text-ivory-50" : "text-ink-500 hover:text-forest-800",
                  )}
                >
                  {code === "en" ? "EN" : "বাং"}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="grid size-9 place-items-center rounded-full border border-ink-900/10 bg-white/70 text-ink-700 transition-colors hover:border-forest-500 hover:text-forest-800"
              aria-label={t("nav.search")}
            >
              <Search className="size-4" aria-hidden />
            </button>

            <Link
              href="/ai-travel-agent"
              className="hidden items-center gap-1.5 rounded-full bg-sunset-500 px-3.5 py-2 text-[13px] font-bold text-[#2a1405] transition-colors hover:bg-sunset-400 sm:inline-flex"
            >
              <Sparkles className="size-3.5" aria-hidden />
              {t("nav.aiAgent")}
            </Link>

            <Link
              href={isAuthed ? "/account" : "/login"}
              className="hidden size-9 place-items-center rounded-full border border-ink-900/10 bg-white/70 text-ink-700 transition-colors hover:border-forest-500 hover:text-forest-800 sm:grid"
              aria-label={isAuthed ? t("nav.account") : t("action.signIn")}
            >
              <User className="size-4" aria-hidden />
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="grid size-9 place-items-center rounded-full border border-ink-900/10 bg-white/70 text-ink-700 lg:hidden"
              aria-label={t("nav.menu")}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
            >
              <Menu className="size-4.5" aria-hidden />
            </button>
          </div>
        </div>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-forest-950/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-label={t("nav.close")}
          />
          <nav
            id="mobile-nav"
            aria-label="Mobile navigation"
            className="absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col overflow-y-auto bg-ivory-50 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-ink-900/10 px-5 py-4">
              <Logo compact />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="grid size-9 place-items-center rounded-full border border-ink-900/10 bg-white"
                aria-label={t("nav.close")}
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>

            <div className="flex-1 space-y-1 px-4 py-4">
              {[
                { href: "/", label: t("nav.home") },
                { href: "/destinations", label: t("nav.destinations") },
                { href: "/districts", label: t("nav.districts") },
                { href: "/experiences", label: t("nav.experiences") },
                { href: "/trip-planner", label: t("nav.aiPlanner") },
                { href: "/packages", label: t("nav.packages") },
                { href: "/travel-guides", label: t("nav.guides") },
                { href: "/blog", label: t("nav.blog") },
                { href: "/map", label: t("nav.map") },
                { href: "/budget-calculator", label: t("nav.budget") },
                { href: "/about", label: t("nav.about") },
                { href: "/faq", label: "FAQ" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3.5 py-3 text-[15px] font-semibold",
                    isActive(item.href) ? "bg-forest-800 text-ivory-50" : "text-ink-700 hover:bg-forest-50",
                  )}
                >
                  {item.label}
                  <ArrowRight className="size-4 opacity-50" aria-hidden />
                </Link>
              ))}

              <div className="mt-4 rounded-2xl bg-forest-900 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-sunset-400">BanglaVoyage AI</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ivory-200/85">
                  Ask for an itinerary, a budget check or a comparison — in Bangla or English.
                </p>
                <Link
                  href="/ai-travel-agent"
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-sunset-500 px-4 py-2.5 text-[13px] font-bold text-[#2a1405]"
                >
                  <Sparkles className="size-3.5" aria-hidden /> {t("action.askAi")}
                </Link>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setLang(lang === "en" ? "bn" : "en")}
                  className="btn btn-ghost flex-1 text-[13px]"
                  lang={lang === "en" ? "bn" : "en"}
                >
                  <Languages className="size-4" aria-hidden />
                  {lang === "en" ? "বাংলায় দেখুন" : "View in English"}
                </button>
                <Link href={isAuthed ? "/account" : "/login"} className="btn btn-primary flex-1 text-[13px]">
                  <User className="size-4" aria-hidden />
                  {isAuthed ? t("nav.account") : t("action.signIn")}
                </Link>
              </div>

              {isAdmin ? (
                <Link href="/admin" className="mt-2 flex items-center justify-center gap-2 py-2 text-[13px] font-semibold text-river-700">
                  <Compass className="size-4" aria-hidden /> {t("nav.admin")}
                </Link>
              ) : null}
            </div>

            <div className="border-t border-ink-900/10 px-5 py-4">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setSearchOpen(true);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl border border-ink-900/15 bg-white px-3.5 py-2.5 text-sm text-ink-400"
              >
                <Search className="size-4" aria-hidden />
                {t("nav.search")}
                <kbd className="ml-auto rounded border border-ink-900/10 px-1.5 py-0.5 text-[10px]">⌘K</kbd>
              </button>
              <p className="mt-3 text-[10.5px] leading-relaxed text-ink-400">
                <Map className="mr-1 inline size-3" aria-hidden />
                <HelpCircle className="mr-1 inline size-3" aria-hidden />
                Estimates only. Verify before you travel.
              </p>
            </div>
          </nav>
        </div>
      ) : null}

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
