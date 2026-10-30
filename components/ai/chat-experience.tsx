"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowUp, Loader2, RotateCcw, Sparkles, Square } from "lucide-react";
import { Markdown } from "@/components/ui/markdown";
import { useLang } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

type Message = { id: string; role: "user" | "assistant"; content: string };

const SUGGESTIONS: Record<"en" | "bn", string[]> = {
  en: [
    "Plan 3 days in Sylhet on a ৳8,000 budget",
    "Compare Sajek and Bandarban for a family trip",
    "Is the Sundarbans open in July?",
    "Best places for a 5-day first trip",
  ],
  bn: [
    "৮,০০০ টাকার মধ্যে ৩ দিনের সিলেট ভ্রমণ পরিকল্পনা",
    "পরিবারের জন্য সাজেক না বান্দরবান?",
    "জুলাই মাসে সুন্দরবন কি খোলা থাকে?",
    "প্রথমবার ৫ দিনে কোথায় যাব?",
  ],
};

export function ChatExperience({ compact = false }: { compact?: boolean }) {
  const { lang, t } = useLang();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsAi, setNeedsAi] = useState(false);
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const greeting =
    lang === "bn"
      ? "আসসালামু আলাইকুম। আমি বাংলাভয়েজ এআই। কোথায় যেতে চান, কত দিন আর কী বাজেট — বলুন, আমি এই সাইটের গন্তব্য-তথ্য ধরে একটি পরিকল্পনা সাজিয়ে দেব।"
      : "Assalamu alaikum — I'm BanglaVoyage AI. Tell me where you're thinking of going, how many days you have and your budget, and I'll draft a plan using this site's destination data.";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streaming]);

  const send = useCallback(
    async (prompt: string) => {
      const trimmed = prompt.trim();
      if (!trimmed || streaming) return;

      setError(null);
      setNeedsAi(false);
      setLastPrompt(trimmed);
      const userMessage: Message = { id: crypto.randomUUID(), role: "user", content: trimmed };
      const history = [...messages, userMessage];
      setMessages(history);
      setInput("");
      setStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;
      const assistantId = crypto.randomUUID();
      let assistantText = "";
      let started = false;

      try {
        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            lang,
            messages: history.slice(-10).map((message) => ({ role: message.role, content: message.content })),
          }),
          signal: controller.signal,
        });

        if (response.status === 503) {
          const data = (await response.json()) as { message?: string };
          setNeedsAi(true);
          setError(data.message ?? null);
          setStreaming(false);
          return;
        }

        if (!response.ok || !response.body) {
          throw new Error((await response.text().catch(() => "")) || "The AI service is unavailable.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          if (!chunk) continue;
          if (!started) {
            started = true;
            setMessages((current) => [...current, { id: assistantId, role: "assistant", content: "" }]);
          }
          assistantText += chunk;
          setMessages((current) =>
            current.map((message) => (message.id === assistantId ? { ...message, content: assistantText } : message)),
          );
        }

        if (!assistantText.trim()) {
          setError("The AI returned an empty response. Please try again.");
        }
      } catch (caught) {
        if ((caught as Error).name === "AbortError") {
          if (assistantText.trim()) {
            setMessages((current) =>
              current.map((message) =>
                message.id === assistantId ? { ...message, content: `${assistantText}\n\n_(stopped)_` } : message,
              ),
            );
          }
        } else {
          setError((caught as Error).message || "Something went wrong. Please try again.");
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
        inputRef.current?.focus();
      }
    },
    [lang, messages, streaming],
  );

  const stop = () => {
    abortRef.current?.abort();
    setStreaming(false);
  };

  return (
    <div className={cn("flex min-h-0 flex-col", compact ? "h-full" : "h-[min(74vh,720px)]")}>
      <div
        ref={scrollRef}
        className={cn("flex-1 overflow-y-auto", compact ? "space-y-4 p-4" : "space-y-5 p-5 sm:p-6")}
        aria-live="polite"
        aria-busy={streaming}
      >
        <div className="flex gap-2.5">
          <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-forest-800 text-ivory-50">
            <Sparkles className="size-3.5" aria-hidden />
          </span>
          <div className="rounded-2xl rounded-tl-md bg-ivory-100 px-3.5 py-2.5 text-[13.5px] leading-relaxed text-ink-700">
            {greeting}
          </div>
        </div>

        {messages.map((message) =>
          message.role === "user" ? (
            <div key={message.id} className="flex justify-end">
              <div className="max-w-[86%] rounded-2xl rounded-tr-md bg-forest-800 px-3.5 py-2.5 text-[13.5px] leading-relaxed text-ivory-50">
                {message.content}
              </div>
            </div>
          ) : (
            <div key={message.id} className="flex gap-2.5">
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-sunset-500 text-[#2a1405]">
                <Sparkles className="size-3.5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md bg-white px-3.5 py-2.5 text-[13.5px] shadow-sm ring-1 ring-ink-900/5">
                <Markdown content={message.content} className="prose-editorial text-[13.5px] leading-relaxed [&_h2]:mt-3 [&_h2]:text-[15px] [&_h3]:mt-3 [&_h3]:text-[14px] [&_p]:mb-2 [&_ul]:mb-2" />
              </div>
            </div>
          ),
        )}

        {streaming && !messages.some((m) => m.role === "assistant" && m.content) ? (
          <div className="flex items-center gap-2 pl-9 text-[12px] text-ink-400">
            <span className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="size-1.5 animate-bounce rounded-full bg-forest-400"
                  style={{ animationDelay: `${i * 120}ms`, animationDuration: "900ms" }}
                />
              ))}
            </span>
            {lang === "bn" ? "ভাবছে…" : "Thinking…"}
          </div>
        ) : null}

        {error && !needsAi ? (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[12.5px] text-red-800">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <div>
              <p>{error}</p>
              {lastPrompt ? (
                <button
                  type="button"
                  onClick={() => send(lastPrompt)}
                  className="mt-1.5 inline-flex items-center gap-1 font-semibold underline"
                >
                  <RotateCcw className="size-3" aria-hidden /> Retry
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {needsAi ? (
          <div className="rounded-xl border border-sunset-100 bg-sunset-100/50 px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-700">
            <p className="font-semibold text-forest-900">{t("ai.setupTitle")}</p>
            <p className="mt-1">{t("ai.setupBody")}</p>
            <p className="mt-2 text-ink-500">
              Meanwhile, the{" "}
              <Link href="/trip-planner" className="text-river-700 underline">
                trip planner
              </Link>{" "}
              and{" "}
              <Link href="/budget-calculator" className="text-river-700 underline">
                budget calculator
              </Link>{" "}
              work without an AI key.
            </p>
          </div>
        ) : null}

        {messages.length === 0 ? (
          <div className="pl-9">
            <p className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.16em] text-ink-400">
              {lang === "bn" ? "শুরু করুন" : "Try asking"}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTIONS[lang].map((suggestion) => (
                <button key={suggestion} type="button" onClick={() => send(suggestion)} className="chip text-[11.5px]">
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          send(input);
        }}
        className="border-t border-ink-900/10 bg-white/70 p-3"
      >
        <div className="flex items-end gap-2">
          <label htmlFor="ai-chat-input" className="sr-only">
            {t("ai.placeholder")}
          </label>
          <textarea
            id="ai-chat-input"
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                send(input);
              }
            }}
            rows={compact ? 1 : 2}
            placeholder={t("ai.placeholder")}
            className="field max-h-32 min-h-[42px] flex-1 resize-none py-2.5 text-[13.5px]"
            disabled={streaming}
          />
          {streaming ? (
            <button
              type="button"
              onClick={stop}
              className="grid size-[42px] shrink-0 place-items-center rounded-xl bg-forest-800 text-ivory-50"
              aria-label="Stop generating"
            >
              <Square className="size-3.5" aria-hidden />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="grid size-[42px] shrink-0 place-items-center rounded-xl bg-forest-800 text-ivory-50 transition-opacity disabled:opacity-40"
              aria-label={t("action.send")}
            >
              <ArrowUp className="size-4" aria-hidden />
            </button>
          )}
        </div>
        <p className="mt-1.5 flex items-center gap-1 text-[10.5px] leading-tight text-ink-400">
          {streaming ? <Loader2 className="size-2.5 animate-spin" aria-hidden /> : null}
          {t("ai.disclaimer")}
        </p>
      </form>
    </div>
  );
}
