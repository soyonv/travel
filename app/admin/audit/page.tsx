import { desc } from "drizzle-orm";
import { auditLogs, contentRevisions } from "@/db/schema";
import { getDbOrNull } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  const db = await getDbOrNull();
  if (!db) return <p className="card p-6 text-[13px] text-ink-500">The database is not connected.</p>;

  const [logs, revisions] = await Promise.all([
    db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(200),
    db.select().from(contentRevisions).orderBy(desc(contentRevisions.createdAt)).limit(40),
  ]);

  return (
    <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
      <section>
        <h2 className="text-[16px] font-bold text-forest-900">Audit log</h2>
        <p className="text-[11.5px] text-ink-400">The latest 200 changes. Records are append-only from the admin UI.</p>
        {logs.length ? (
          <ul className="mt-3 divide-y divide-ink-900/5 rounded-xl border border-ink-900/8 bg-white">
            {logs.map((log) => (
              <li key={log.id} className="px-3.5 py-2.5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-[12px] font-semibold text-forest-900">{log.action}</p>
                  <p className="text-[10px] text-ink-400">{formatDate(log.createdAt)}</p>
                </div>
                <p className="text-[11px] text-ink-500">
                  {log.entityType ?? "entity"} {log.entityId ? `· ${log.entityId.slice(0, 40)}` : ""}
                  {log.detail ? ` · ${log.detail}` : ""}
                </p>
                <p className="text-[10px] text-ink-400">{log.actorEmail ?? "system"}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 rounded-xl border border-dashed border-ink-900/15 px-4 py-6 text-center text-[12px] text-ink-500">
            No changes recorded yet.
          </p>
        )}
      </section>

      <section>
        <h2 className="text-[16px] font-bold text-forest-900">Recent revisions</h2>
        <p className="text-[11.5px] text-ink-400">
          Snapshots are stored as JSON before an edit. There is no restore button yet — export the snapshot manually if you
          need to roll back.
        </p>
        {revisions.length ? (
          <ul className="mt-3 space-y-2">
            {revisions.map((revision) => (
              <li key={revision.id} className="rounded-xl border border-ink-900/8 bg-white px-3 py-2.5">
                <p className="text-[11.5px] font-semibold text-forest-900">
                  {revision.entityType} · {revision.entityId.slice(0, 24)}
                </p>
                <p className="text-[10px] text-ink-400">
                  {formatDate(revision.createdAt)} · {revision.snapshot.length.toLocaleString()} bytes
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 rounded-xl border border-dashed border-ink-900/15 px-4 py-6 text-center text-[12px] text-ink-500">
            Revisions appear the first time you update existing content.
          </p>
        )}
      </section>
    </div>
  );
}
