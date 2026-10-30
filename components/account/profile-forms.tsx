"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertTriangle, CheckCircle2, Download, KeyRound, Loader2, Save } from "lucide-react";
import {
  changePasswordAction,
  deleteAccountAction,
  updateProfileAction,
  type AuthState,
} from "@/app/actions/auth";
import { cn } from "@/lib/utils";

const initial: AuthState = { ok: false, message: "" };

function Status({ state }: { state: AuthState }) {
  if (!state.message) return null;
  return (
    <p
      role="status"
      className={cn(
        "flex items-start gap-2 rounded-xl border px-3 py-2.5 text-[11.5px] leading-relaxed",
        state.ok ? "border-forest-100 bg-forest-50 text-forest-700" : "border-red-200 bg-red-50 text-red-800",
      )}
    >
      {state.ok ? <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" aria-hidden /> : <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />}
      {state.message}
    </p>
  );
}

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-primary px-4 py-2 text-[12.5px] disabled:opacity-70">
      {pending ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <Save className="size-3.5" aria-hidden />}
      {pending ? "Saving…" : label}
    </button>
  );
}

export function ProfileForm({ name, locale }: { name: string; locale: string }) {
  const [state, action] = useActionState(updateProfileAction, initial);
  return (
    <form action={action} className="space-y-3">
      <div>
        <label htmlFor="profile-name" className="label">
          Display name
        </label>
        <input id="profile-name" name="name" defaultValue={name} required minLength={2} className="field" />
      </div>
      <div>
        <label htmlFor="profile-locale" className="label">
          Preferred language
        </label>
        <select id="profile-locale" name="locale" defaultValue={locale} className="field">
          <option value="en">English</option>
          <option value="bn">বাংলা</option>
        </select>
      </div>
      <Status state={state} />
      <Submit label="Update profile" />
    </form>
  );
}

export function PasswordForm() {
  const [state, action] = useActionState(changePasswordAction, initial);
  return (
    <form action={action} className="space-y-3">
      <div>
        <label htmlFor="current-password" className="label">
          Current password
        </label>
        <input id="current-password" name="current" type="password" required autoComplete="current-password" className="field" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="password-new" className="label">
            New password
          </label>
          <input id="password-new" name="password" type="password" required minLength={10} autoComplete="new-password" className="field" />
        </div>
        <div>
          <label htmlFor="password-confirm" className="label">
            Confirm
          </label>
          <input id="password-confirm" name="confirm" type="password" required autoComplete="new-password" className="field" />
        </div>
      </div>
      <Status state={state} />
      <button type="submit" className="btn btn-ghost px-4 py-2 text-[12.5px]">
        <KeyRound className="size-3.5" aria-hidden /> Change password
      </button>
    </form>
  );
}

export function ExportDataButton() {
  return (
    <a href="/api/account/export" className="btn btn-ghost px-4 py-2 text-[12.5px]" download>
      <Download className="size-3.5" aria-hidden /> Export my data (JSON)
    </a>
  );
}

export function DeleteAccountForm() {
  const [state, action] = useActionState(deleteAccountAction, initial);
  return (
    <details className="rounded-xl border border-red-200 bg-red-50/40 px-4 py-3">
      <summary className="cursor-pointer text-[12.5px] font-bold text-red-800">Delete my account</summary>
      <p className="mt-2 text-[11.5px] leading-relaxed text-red-800/80">
        This removes your profile, saved places, saved reading and every itinerary. It cannot be undone. Download an export
        first if you want a copy.
      </p>
      <form action={action} className="mt-3 space-y-2">
        <div>
          <label htmlFor="delete-password" className="label">
            Password
          </label>
          <input id="delete-password" name="password" type="password" required autoComplete="current-password" className="field" />
        </div>
        <div>
          <label htmlFor="delete-confirm" className="label">
            Type DELETE to confirm
          </label>
          <input id="delete-confirm" name="confirm" required pattern="DELETE" className="field" placeholder="DELETE" />
        </div>
        <Status state={state} />
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-full bg-red-700 px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-red-800"
        >
          Delete permanently
        </button>
      </form>
    </details>
  );
}
