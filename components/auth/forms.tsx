"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, Loader2, LockKeyhole, Mail, User } from "lucide-react";
import {
  loginAction,
  registerAction,
  requestPasswordResetAction,
  resetPasswordAction,
  type AuthState,
} from "@/app/actions/auth";
import { useLang } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

const initial: AuthState = { ok: false, message: "" };

function Submit({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-primary w-full px-5 text-[13.5px] disabled:opacity-70">
      {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      {pending ? pendingLabel : label}
    </button>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-[11px] text-red-700">{message}</p>;
}

export function LoginForm({ next, resetDone = false }: { next?: string; resetDone?: boolean }) {
  const [state, action] = useActionState(loginAction, initial);

  return (
    <form action={action} className="space-y-3">
      {resetDone ? (
        <p className="flex items-start gap-2 rounded-xl border border-forest-100 bg-forest-50 px-3 py-2.5 text-[12px] text-forest-700">
          <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" aria-hidden /> Password reset. Sign in with your new password.
        </p>
      ) : null}
      <input type="hidden" name="next" value={next ?? "/account"} />
      <div>
        <label htmlFor="login-email" className="label">
          Email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <input
            id="login-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="field pl-9"
            placeholder="you@example.com"
            aria-invalid={state.fieldErrors?.email ? "true" : undefined}
          />
        </div>
        <FieldError message={state.fieldErrors?.email} />
      </div>
      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="login-password" className="label">
            Password
          </label>
          <Link href="/forgot-password" className="mb-1.5 text-[11px] font-semibold text-river-700 underline">
            Forgot?
          </Link>
        </div>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <input
            id="login-password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="field pl-9"
            placeholder="Your password"
          />
        </div>
      </div>

      {state.message && !state.ok ? (
        <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[12px] text-red-800">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden /> {state.message}
        </p>
      ) : null}

      <Submit label="Sign in" pendingLabel="Signing in…" />
      <p className="text-center text-[12px] text-ink-500">
        New here?{" "}
        <Link href={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-river-700 underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm({ next }: { next?: string }) {
  const [state, action] = useActionState(registerAction, initial);
  const { lang } = useLang();

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="locale" value={lang} />
      <div>
        <label htmlFor="register-name" className="label">
          Name
        </label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <input
            id="register-name"
            name="name"
            required
            autoComplete="name"
            minLength={2}
            className="field pl-9"
            aria-invalid={state.fieldErrors?.name ? "true" : undefined}
          />
        </div>
        <FieldError message={state.fieldErrors?.name} />
      </div>
      <div>
        <label htmlFor="register-email" className="label">
          Email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <input
            id="register-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="field pl-9"
            aria-invalid={state.fieldErrors?.email ? "true" : undefined}
          />
        </div>
        <FieldError message={state.fieldErrors?.email} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="register-password" className="label">
            Password
          </label>
          <input
            id="register-password"
            name="password"
            type="password"
            required
            minLength={10}
            autoComplete="new-password"
            className="field"
            aria-invalid={state.fieldErrors?.password ? "true" : undefined}
          />
          <FieldError message={state.fieldErrors?.password} />
        </div>
        <div>
          <label htmlFor="register-confirm" className="label">
            Confirm
          </label>
          <input
            id="register-confirm"
            name="confirm"
            type="password"
            required
            autoComplete="new-password"
            className="field"
            aria-invalid={state.fieldErrors?.confirm ? "true" : undefined}
          />
          <FieldError message={state.fieldErrors?.confirm} />
        </div>
      </div>
      <p className="text-[10.5px] leading-relaxed text-ink-400">
        At least 10 characters, including a letter and a number. We store a PBKDF2 hash, never the password itself.
      </p>
      <label className="flex items-start gap-2 text-[11.5px] leading-relaxed text-ink-600">
        <input type="checkbox" name="consent" required className="mt-0.5 size-3.5 accent-forest-600" />
        <span>
          I agree to the{" "}
          <Link href="/terms" className="text-river-700 underline">
            terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-river-700 underline">
            privacy policy
          </Link>
          . I can delete my account at any time.
        </span>
      </label>

      {state.message && !state.ok ? (
        <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[12px] text-red-800">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden /> {state.message}
        </p>
      ) : null}

      <Submit label="Create account" pendingLabel="Creating…" />
      <p className="text-center text-[12px] text-ink-500">
        Already have an account?{" "}
        <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-river-700 underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export function ResetRequestForm() {
  const [state, action] = useActionState(requestPasswordResetAction, initial);

  return (
    <form action={action} className="space-y-3">
      <div>
        <label htmlFor="reset-email" className="label">
          Account email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <input id="reset-email" name="email" type="email" required autoComplete="email" className="field pl-9" />
        </div>
      </div>
      {state.message ? (
        <p
          role="status"
          className={cn(
            "rounded-xl border px-3 py-2.5 text-[11.5px] leading-relaxed",
            state.ok ? "border-forest-100 bg-forest-50 text-forest-700" : "border-red-200 bg-red-50 text-red-800",
          )}
        >
          {state.message}
        </p>
      ) : null}
      <Submit label="Send reset link" pendingLabel="Sending…" />
      <p className="text-center text-[12px] text-ink-500">
        <Link href="/login" className="font-semibold text-river-700 underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPasswordAction, initial);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="token" value={token} />
      <div>
        <label htmlFor="new-password" className="label">
          New password
        </label>
        <input
          id="new-password"
          name="password"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
          className="field"
          aria-invalid={state.fieldErrors?.password ? "true" : undefined}
        />
        <FieldError message={state.fieldErrors?.password} />
      </div>
      <div>
        <label htmlFor="new-confirm" className="label">
          Confirm new password
        </label>
        <input id="new-confirm" name="confirm" type="password" required autoComplete="new-password" className="field" />
      </div>
      {state.message && !state.ok ? (
        <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[12px] text-red-800">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden /> {state.message}
        </p>
      ) : null}
      <Submit label="Set new password" pendingLabel="Saving…" />
    </form>
  );
}
