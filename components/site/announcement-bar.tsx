"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Megaphone, X } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import type { Lang } from "@/lib/i18n";

type Item = { id: string; messageEn: string; messageBn: string | null; link: string | null };

export function AnnouncementBar({ items, lang }: { items: Item[]; lang: Lang }) {
  const [dismissed, setDismissed] = useState(false);
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("db-announcement-dismissed") === "1") setDismissed(true);
  }, []);

  useEffect(() => {
    if (items.length < 2 || reduce) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % items.length), 9000);
    return () => clearInterval(timer);
  }, [items.length, reduce]);

  if (dismissed || items.length === 0) return null;
  const item = items[index];

  return (
    <div data-print-hide="true" className="relative bg-forest-900 text-ivory-100">
      <div className="page flex items-center gap-3 py-2">
        <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-sunset-400 sm:inline-flex">
          <Megaphone className="size-3" aria-hidden /> Notice
        </span>
        <p key={item.id} className={cn("flex-1 text-[12px] leading-snug text-ivory-200/90", reduce ? "" : "animate-in fade-in")}>
          <span lang={lang === "bn" && item.messageBn ? "bn" : "en"}>{lang === "bn" && item.messageBn ? item.messageBn : item.messageEn}</span>
          {item.link ? (
            <Link href={item.link} className="ml-2 inline-flex items-center gap-0.5 font-semibold text-sunset-400 underline underline-offset-2">
              Read more <ArrowRight className="size-3" aria-hidden />
            </Link>
          ) : null}
        </p>
        {items.length > 1 ? (
          <div className="hidden items-center gap-1 sm:flex" role="tablist" aria-label="Announcements">
            {items.map((entry, i) => (
              <button
                key={entry.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Announcement ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn("size-1.5 rounded-full transition-colors", i === index ? "bg-sunset-400" : "bg-white/25")}
              />
            ))}
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => {
            sessionStorage.setItem("db-announcement-dismissed", "1");
            setDismissed(true);
          }}
          className="grid size-6 shrink-0 place-items-center rounded-full text-ivory-200/70 hover:bg-white/10 hover:text-ivory-50"
          aria-label="Dismiss announcement"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
