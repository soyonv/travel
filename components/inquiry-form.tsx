"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { submitInquiryAction, type FormState } from "@/app/actions/public";
import { cn } from "@/lib/utils";

const initialState: FormState = { ok: false, message: "" };

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-primary px-5 text-[13px] disabled:opacity-70">
      {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />}
      {pending ? "Sending…" : "Send inquiry"}
    </button>
  );
}

export function InquiryForm({
  type = "general",
  subject = "",
  compact = false,
}: {
  type?: "general" | "package" | "listing" | "partnership" | "correction" | "data";
  subject?: string;
  compact?: boolean;
}) {
  const [state, formAction] = useActionState(submitInquiryAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="type" value={type} />
      <div className={cn("grid gap-3", compact ? "" : "sm:grid-cols-2")}>
        <div>
          <label htmlFor={`inq-name-${type}`} className="label">
            Name
          </label>
          <input
            id={`inq-name-${type}`}
            name="name"
            required
            autoComplete="name"
            className="field"
            aria-invalid={state.fieldErrors?.name ? "true" : undefined}
          />
          {state.fieldErrors?.name ? <p className="mt-1 text-[11px] text-red-700">{state.fieldErrors.name}</p> : null}
        </div>
        <div>
          <label htmlFor={`inq-email-${type}`} className="label">
            Email
          </label>
          <input
            id={`inq-email-${type}`}
            name="email"
            type="email"
            required
            autoComplete="email"
            className="field"
            aria-invalid={state.fieldErrors?.email ? "true" : undefined}
          />
          {state.fieldErrors?.email ? <p className="mt-1 text-[11px] text-red-700">{state.fieldErrors.email}</p> : null}
        </div>
      </div>
      <div className={cn("grid gap-3", compact ? "" : "sm:grid-cols-2")}>
        <div>
          <label htmlFor={`inq-phone-${type}`} className="label">
            Phone <span className="font-normal text-ink-400">(optional)</span>
          </label>
          <input id={`inq-phone-${type}`} name="phone" autoComplete="tel" className="field" />
        </div>
        <div>
          <label htmlFor={`inq-subject-${type}`} className="label">
            Subject
          </label>
          <input
            id={`inq-subject-${type}`}
            name="subject"
            required
            defaultValue={subject}
            className="field"
            aria-invalid={state.fieldErrors?.subject ? "true" : undefined}
          />
          {state.fieldErrors?.subject ? <p className="mt-1 text-[11px] text-red-700">{state.fieldErrors.subject}</p> : null}
        </div>
      </div>
      <div>
        <label htmlFor={`inq-message-${type}`} className="label">
          Message
        </label>
        <textarea
          id={`inq-message-${type}`}
          name="message"
          required
          rows={4}
          minLength={15}
          className="field resize-y"
          placeholder="Dates, group size, what you want to see, and anything the team should know."
          aria-invalid={state.fieldErrors?.message ? "true" : undefined}
        />
        {state.fieldErrors?.message ? <p className="mt-1 text-[11px] text-red-700">{state.fieldErrors.message}</p> : null}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Submit />
        <p className="text-[11px] leading-snug text-ink-400">
          No payment details, please. We do not sell or share contact details.
        </p>
      </div>
      {state.message ? (
        <p
          role="status"
          className={cn("flex items-start gap-1.5 text-[12px]", state.ok ? "text-forest-700" : "text-red-700")}
        >
          {state.ok ? <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" aria-hidden /> : null}
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
