"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { subscribeNewsletterAction, type FormState } from "@/app/actions/public";
import { useLang } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

const initialState: FormState = { ok: false, message: "" };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-sunset h-[46px] px-5 text-[13px] disabled:opacity-70">
      {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Mail className="size-4" aria-hidden />}
      {pending ? "Sending…" : label}
    </button>
  );
}

export function NewsletterForm({ tone = "dark", source = "footer" }: { tone?: "dark" | "light"; source?: string }) {
  const { t, lang } = useLang();
  const [state, formAction] = useActionState(subscribeNewsletterAction, initialState);

  return (
    <form action={formAction} className="w-full">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor={`newsletter-email-${source}`}>
          {t("auth.email")}
        </label>
        <input
          id={`newsletter-email-${source}`}
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={state.fieldErrors?.email ? "true" : undefined}
          aria-describedby={state.fieldErrors?.email ? `newsletter-error-${source}` : undefined}
          className={cn(
            "field h-[46px] flex-1",
            tone === "dark" && "border-white/20 bg-white/10 text-ivory-50 placeholder:text-ivory-200/50",
          )}
        />
        <input type="hidden" name="locale" value={lang} />
        <input type="hidden" name="source" value={source} />
        <SubmitButton label={t("action.subscribe")} />
      </div>
      <label className="mt-3 flex items-start gap-2 text-[11.5px] leading-relaxed">
        <input type="checkbox" name="consent" required className="mt-0.5 size-3.5 accent-sunset-500" />
        <span className={tone === "dark" ? "text-ivory-200/70" : "text-ink-500"}>
          I agree to receive the monthly email and understand I can unsubscribe at any time. See the{" "}
          <a href="/privacy" className={tone === "dark" ? "underline" : "text-river-700 underline"}>
            privacy policy
          </a>
          .
        </span>
      </label>
      {state.message ? (
        <p
          id={`newsletter-error-${source}`}
          className={cn(
            "mt-2 flex items-center gap-1.5 text-[12px]",
            state.ok ? "text-forest-400" : "text-red-500",
            tone === "light" && state.ok && "text-forest-700",
          )}
          role="status"
        >
          {state.ok ? <CheckCircle2 className="size-3.5" aria-hidden /> : null}
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
