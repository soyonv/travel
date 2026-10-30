import { desc } from "drizzle-orm";
import { AlertTriangle } from "lucide-react";
import { travelAlerts } from "@/db/schema";
import { getDbOrNull } from "@/lib/db";
import { deleteAlertAction, saveAlertAction, toggleAlertAction } from "@/app/actions/admin";
import { ConfirmSubmit, SaveButton } from "@/components/admin/nav";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminAlertsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; updated?: string; deleted?: string; error?: string }>;
}) {
  const params = await searchParams;
  const db = await getDbOrNull();
  if (!db) return <p className="card p-6 text-[13px] text-ink-500">The database is not connected.</p>;
  const rows = await db.select().from(travelAlerts).orderBy(desc(travelAlerts.createdAt));

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <section>
        <h2 className="text-[17px] font-bold text-forest-900">Travel alerts</h2>
        <p className="text-[11.5px] text-ink-400">
          {rows.length} notices. Active alerts appear on the homepage and relevant destination pages. Only publish what an
          official source confirms, and link it.
        </p>

        {params.saved ? <p className="mt-3 rounded-lg bg-forest-50 px-3 py-2 text-[11.5px] text-forest-700">Alert created.</p> : null}
        {params.updated ? <p className="mt-3 rounded-lg bg-forest-50 px-3 py-2 text-[11.5px] text-forest-700">Alert updated.</p> : null}
        {params.deleted ? <p className="mt-3 rounded-lg bg-ivory-100 px-3 py-2 text-[11.5px] text-ink-600">Alert deleted.</p> : null}
        {params.error ? <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[11.5px] text-red-700">{params.error}</p> : null}

        <ul className="mt-4 space-y-2">
          {rows.map((alert) => (
            <li key={alert.id} className="card p-3.5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-[13px] font-bold text-forest-900">
                    <AlertTriangle className="size-3.5 text-sunset-500" aria-hidden />
                    {alert.title}
                  </p>
                  <p className="mt-0.5 text-[10.5px] text-ink-400">
                    {alert.severity} · {alert.region ?? "all regions"} · {formatDate(alert.createdAt)} ·{" "}
                    {alert.active ? "active" : "inactive"}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <form action={toggleAlertAction}>
                    <input type="hidden" name="id" value={alert.id} />
                    <input type="hidden" name="active" value={alert.active ? "" : "on"} />
                    <button type="submit" className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold text-forest-700 hover:bg-forest-50">
                      {alert.active ? "Deactivate" : "Activate"}
                    </button>
                  </form>
                  <form action={deleteAlertAction}>
                    <input type="hidden" name="id" value={alert.id} />
                    <ConfirmSubmit confirmMessage={`Delete “${alert.title}”?`} />
                  </form>
                </div>
              </div>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-600">{alert.body}</p>
              {alert.sourceUrl ? (
                <a
                  href={alert.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-[10.5px] font-semibold text-river-700 underline"
                >
                  {alert.sourceName ?? alert.sourceUrl}
                </a>
              ) : (
                <p className="mt-1 text-[10px] text-sunset-600">No source attached — add one before relying on this.</p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="card h-fit p-4">
        <h2 className="text-[14px] font-bold text-forest-900">New alert</h2>
        <form action={saveAlertAction} className="mt-3 space-y-3">
          <div>
            <label htmlFor="alert-title" className="label">Title</label>
            <input id="alert-title" name="title" required minLength={4} className="field" />
          </div>
          <div>
            <label htmlFor="alert-body" className="label">Body</label>
            <textarea id="alert-body" name="body" required minLength={10} rows={4} className="field" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="alert-severity" className="label">Severity</label>
              <select id="alert-severity" name="severity" className="field">
                <option value="info">Info</option>
                <option value="caution">Caution</option>
                <option value="warning">Warning</option>
              </select>
            </div>
            <div>
              <label htmlFor="alert-region" className="label">Region</label>
              <input id="alert-region" name="region" className="field" placeholder="e.g. Khulna" />
            </div>
          </div>
          <div>
            <label htmlFor="alert-source-url" className="label">Official source URL</label>
            <input id="alert-source-url" name="sourceUrl" type="url" className="field" placeholder="https://…" />
          </div>
          <div>
            <label htmlFor="alert-source-name" className="label">Source name</label>
            <input id="alert-source-name" name="sourceName" className="field" placeholder="Forest Department" />
          </div>
          <SaveButton label="Publish alert" />
        </form>
      </section>
    </div>
  );
}
