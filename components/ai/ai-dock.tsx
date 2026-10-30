"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageCircle, Sparkles, X } from "lucide-react";
import { ChatExperience } from "@/components/ai/chat-experience";
import { useLang } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

export function AiDock() {
  const pathname = usePathname();
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (pathname.startsWith("/ai-travel-agent") || pathname.startsWith("/admin")) return null;

  return (
    <>
      {open ? (
        <div
          data-print-hide="true"
          className="fixed inset-x-3 bottom-3 z-[70] overflow-hidden rounded-2xl border border-ink-900/10 bg-ivory-50 shadow-[0_30px_90px_-30px_rgba(7,28,22,0.6)] sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[390px]"
          role="dialog"
          aria-label={t("ai.title")}
          aria-modal="false"
        >
          <div className="flex items-center justify-between border-b border-ink-900/10 bg-forest-900 px-4 py-3 text-ivory-50">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-sunset-400" aria-hidden />
              <div className="leading-tight">
                <p className="text-[13px] font-bold">{t("ai.title")}</p>
                <p className="text-[10px] text-ivory-200/65">Grounded in destination data</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid size-7 place-items-center rounded-full hover:bg-white/15"
              aria-label={t("nav.close")}
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <div className="h-[min(62vh,470px)]">
            <ChatExperience compact />
          </div>
        </div>
      ) : null}

      <button
        type="button"
        data-print-hide="true"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "fixed bottom-5 right-5 z-[65] flex items-center gap-2 rounded-full bg-forest-900 px-4 py-3 text-[13px] font-semibold text-ivory-50 shadow-[0_18px_40px_-16px_rgba(7,28,22,0.85)] transition-transform hover:scale-[1.03] active:scale-95",
          open && "opacity-0 pointer-events-none",
        )}
        aria-expanded={open}
        aria-controls="ai-dock-panel"
      >
        <span className="relative grid place-items-center">
          <MessageCircle className="size-4" aria-hidden />
          <span className="absolute -right-1 -top-1 size-2 rounded-full bg-sunset-400" aria-hidden />
        </span>
        {t("action.askAi")}
      </button>
    </>
  );
}
