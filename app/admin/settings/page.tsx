import { asc } from "drizzle-orm";
import { announcements } from "@/db/schema";
import { getBindings, getDbOrNull } from "@/lib/db";
import {
  deleteAnnouncementAction,
  saveAnnouncementAction,
  saveSettingAction,
  toggleAnnouncementAction,
} from "@/app/actions/admin";
import { ConfirmSubmit, SaveButton } from "@/components/admin/nav";
import { getSettings } from "@/lib/queries";
import { isAiConfigured } from "@/lib/ai";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; updated?: string; deleted?: string; error?: string }>;
}) {
  const params = await searchParams;
  const db = await getDbOrNull();
  if (!db) return <p className="card p-6 text-[13px] text-ink-500">The database is not connected.</p>;

  const [announcementRows, settings, bindings] = await Promise.all([
    db.select().from(announcements).orderBy(asc(announcements.sort)),
    getSettings(db),
    getBindings(),
  ]);

  const checks = [
    { label: "AI_API_KEY", ok: isAiConfigured(bindings), note: "Chat and AI-generated plans" },
    { label: "FILES (R2)", ok: Boolean(bindings.FILES), note: "Uploads through the editor" },
    { label: "RESEND_API_KEY + EMAIL_FROM", ok: Boolean(bindings.RESEND_API_KEY && bindings.EMAIL_FROM), note: "Password reset email" },
    { label: "ADMIN_BOOTSTRAP_EMAIL", ok: Boolean(bindings.ADMIN_BOOTSTRAP_EMAIL), note: "Auto-admin for that sign-up email" },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-5">
        <section id="announcements">
          <h2 className="text-[16px] font-bold text-forest-900">Announcements</h2>
          <p className="text-[11.5px] text-ink-400">
            These appear in the bar above the header. Keep them short, seasonal and factual.
          </p>

          {params.saved ? <p className="mt-3 rounded-lg bg-forest-50 px-3 py-2 text-[11.5px] text-forest-700">Announcement added.</p> : null}
          {params.updated ? <p className="mt-3 rounded-lg bg-forest-50 px-3 py-2 text-[11.5px] text-forest-700">Updated.</p> : null}
          {params.deleted ? <p className="mt-3 rounded-lg bg-ivory-100 px-3 py-2 text-[11.5px] text-ink-600">Deleted.</p> : null}
          {params.error ? <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[11.5px] text-red-700">{params.error}</p> : null}

          <ul className="mt-3 space-y-2">
            {announcementRows.map((row) => (
              <li key={row.id} className="card p-3.5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-semibold text-forest-900">{row.messageEn}</p>
                    {row.messageBn ? <p className="text-[11px] text-ink-500" lang="bn">{row.messageBn}</p> : null}
                    <p className="text-[10px] text-ink-400">
                      sort {row.sort} · {row.active ? "active" : "hidden"}
                      {row.link ? ` · links to ${row.link}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <form action={toggleAnnouncementAction}>
                      <input type="hidden" name="id" value={row.id} />
                      <input type="hidden" name="active" value={row.active ? "" : "on"} />
                      <button type="submit" className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold text-forest-700 hover:bg-forest-50">
                        {row.active ? "Hide" : "Show"}
                      </button>
                    </form>
                    <form action={deleteAnnouncementAction}>
                      <input type="hidden" name="id" value={row.id} />
                      <ConfirmSubmit confirmMessage="Delete this announcement?" />
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <form action={saveAnnouncementAction} className="card mt-3 space-y-3 p-4">
            <h3 className="text-[13px] font-bold text-forest-900">Add an announcement</h3>
            <div>
              <label htmlFor="announcement-en" className="label">Message (English)</label>
              <input id="announcement-en" name="messageEn" required minLength={8} className="field" />
            </div>
            <div>
              <label htmlFor="announcement-bn" className="label">Message (Bangla, optional)</label>
              <input id="announcement-bn" name="messageBn" className="field" lang="bn" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="announcement-link" className="label">Link (optional)</label>
                <input id="announcement-link" name="link" className="field" placeholder="/travel-guides" />
              </div>
              <div>
                <label htmlFor="announcement-sort" className="label">Sort order</label>
                <input id="announcement-sort" name="sort" type="number" defaultValue={0} className="field" />
              </div>
            </div>
            <SaveButton label="Add announcement" />
          </form>
        </section>

        <section id="settings">
          <h2 className="text-[16px] font-bold text-forest-900">Site settings</h2>
          <p className="text-[11.5px] text-ink-400">Plain key/value pairs used for editorial copy and metadata defaults.</p>
          <div className="mt-3 space-y-2">
            {Object.entries(settings).map(([key, value]) => (
              <form key={key} action={saveSettingAction} className="card flex flex-wrap items-end gap-2 p-3">
                <input type="hidden" name="key" value={key} />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10.5px] font-semibold text-forest-800">{key}</p>
                  <textarea name="value" defaultValue={value} rows={1} className="field mt-1 py-1.5 text-[11.5px]" />
                </div>
                <button type="submit" className="btn btn-ghost px-3 py-1.5 text-[10.5px]">
                  Save
                </button>
              </form>
            ))}
            <form action={saveSettingAction} className="card flex flex-wrap items-end gap-2 p-3">
              <div className="w-40">
                <label htmlFor="new-setting-key" className="label">New key</label>
                <input id="new-setting-key" name="key" required className="field py-1.5 text-[11.5px]" placeholder="editorial_note" />
              </div>
              <div className="min-w-0 flex-1">
                <label htmlFor="new-setting-value" className="label">Value</label>
                <input id="new-setting-value" name="value" className="field py-1.5 text-[11.5px]" />
              </div>
              <button type="submit" className="btn btn-primary px-3 py-1.5 text-[10.5px]">
                Add
              </button>
            </form>
          </div>
        </section>
      </div>

      <aside className="space-y-4">
        <section className="card p-4">
          <h2 className="text-[14px] font-bold text-forest-900">Environment checks</h2>
          <p className="text-[10.5px] text-ink-400">Secrets are read server-side. Nothing here is sent to the browser.</p>
          <ul className="mt-2 space-y-2">
            {checks.map((check) => (
              <li key={check.label} className="flex items-start justify-between gap-2 border-b border-ink-900/5 pb-2 last:border-0 last:pb-0">
                <div>
                  <p className="font-mono text-[10.5px] text-ink-700">{check.label}</p>
                  <p className="text-[10px] text-ink-400">{check.note}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                    check.ok ? "bg-forest-100 text-forest-800" : "bg-sunset-100 text-sunset-600"
                  }`}
                >
                  {check.ok ? "set" : "missing"}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[10px] leading-relaxed text-ink-400">
            On Cloudflare, add these as Worker secrets/variables. Locally, use <code>.dev.vars</code> or the README workflow.
          </p>
        </section>

        <section className="rounded-xl border border-forest-100 bg-forest-50 p-4 text-[11px] leading-relaxed text-forest-700">
          <p className="font-bold">Before you publish</p>
          <ul className="mt-1.5 space-y-1">
            <li>· A source is attached for every factual claim.</li>
            <li>· Prices are labelled estimates and dates are verified or absent.</li>
            <li>· Operators are not presented as sellers unless checked.</li>
            <li>· Sensitive access notes mention the official authority.</li>
          </ul>
        </section>
      </aside>
    </div>
  );
}
