import Link from "next/link";
import { desc } from "drizzle-orm";
import { inquiries, newsletterSubscribers } from "@/db/schema";
import { getDbOrNull } from "@/lib/db";
import { deleteSubscriberAction, updateInquiryStatusAction } from "@/app/actions/admin";
import { ConfirmSubmit } from "@/components/admin/nav";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUSES = ["new", "open", "closed", "spam"] as const;

export default async function AdminSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab === "subscribers" ? "subscribers" : "inquiries";
  const db = await getDbOrNull();
  if (!db) return <p className="card p-6 text-[13px] text-ink-500">The database is not connected.</p>;

  const [inquiryRows, subscriberRows] = await Promise.all([
    db.select().from(inquiries).orderBy(desc(inquiries.createdAt)).limit(200),
    db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.consentAt)).limit(200),
  ]);

  const newCount = inquiryRows.filter((row) => row.status === "new").length;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/admin/submissions?tab=inquiries"
          className={cn(
            "rounded-full px-3 py-1.5 text-[11.5px] font-semibold",
            tab === "inquiries" ? "bg-forest-800 text-ivory-50" : "bg-white text-ink-600 ring-1 ring-ink-900/8",
          )}
        >
          Inquiries ({inquiryRows.length}){newCount ? ` · ${newCount} new` : ""}
        </Link>
        <Link
          href="/admin/submissions?tab=subscribers"
          className={cn(
            "rounded-full px-3 py-1.5 text-[11.5px] font-semibold",
            tab === "subscribers" ? "bg-forest-800 text-ivory-50" : "bg-white text-ink-600 ring-1 ring-ink-900/8",
          )}
        >
          Newsletter ({subscriberRows.length})
        </Link>
      </div>

      {tab === "inquiries" ? (
        <section className="mt-4">
          <h2 className="text-[15px] font-bold text-forest-900">Inquiries</h2>
          <p className="text-[11.5px] text-ink-400">
            Contact details are shown to staff only. Reply by email; no automated email is sent from this panel.
          </p>
          {inquiryRows.length ? (
            <ul className="mt-3 space-y-2">
              {inquiryRows.map((row) => (
                <li key={row.id} className="card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-[13px] font-bold text-forest-900">{row.subject}</p>
                      <p className="text-[10.5px] text-ink-400">
                        {row.name} · <a href={`mailto:${row.email}`} className="text-river-700 underline">{row.email}</a>
                        {row.phone ? ` · ${row.phone}` : ""} · {row.type} · {formatDate(row.createdAt)}
                      </p>
                    </div>
                    <span className="rounded-full bg-ivory-100 px-2 py-0.5 text-[9.5px] font-bold uppercase text-ink-500">
                      {row.status}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-[12px] leading-relaxed text-ink-700">{row.message}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {STATUSES.filter((status) => status !== row.status).map((status) => (
                      <form key={status} action={updateInquiryStatusAction}>
                        <input type="hidden" name="id" value={row.id} />
                        <input type="hidden" name="status" value={status} />
                        <button
                          type="submit"
                          className="rounded-full border border-ink-900/10 px-2.5 py-1 text-[10.5px] font-semibold text-ink-600 hover:border-forest-500 hover:text-forest-800"
                        >
                          Mark {status}
                        </button>
                      </form>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 rounded-xl border border-dashed border-ink-900/15 px-4 py-6 text-center text-[12px] text-ink-500">
              No inquiries yet.
            </p>
          )}
        </section>
      ) : (
        <section className="mt-4">
          <h2 className="text-[15px] font-bold text-forest-900">Newsletter subscribers</h2>
          <p className="text-[11.5px] text-ink-400">
            Consent timestamp is recorded at sign-up. Remove an address on request; do not export this list to third parties.
          </p>
          <div className="mt-3 overflow-x-auto rounded-xl border border-ink-900/8 bg-white">
            <table className="w-full min-w-[520px] text-left text-[12px]">
              <thead className="bg-ivory-100/70 text-[10px] uppercase tracking-[0.1em] text-ink-400">
                <tr>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Email</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Locale</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Source</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Consented</th>
                  <th scope="col" className="px-3 py-2.5 text-right font-semibold">Remove</th>
                </tr>
              </thead>
              <tbody>
                {subscriberRows.map((row) => (
                  <tr key={row.id} className="border-t border-ink-900/5">
                    <td className="px-3 py-2 font-medium text-ink-700">{row.email}</td>
                    <td className="px-3 py-2 text-ink-500">{row.locale}</td>
                    <td className="px-3 py-2 text-ink-500">{row.source ?? "—"}</td>
                    <td className="px-3 py-2 text-[10.5px] text-ink-400">{formatDate(row.consentAt)}</td>
                    <td className="px-3 py-2 text-right">
                      <form action={deleteSubscriberAction}>
                        <input type="hidden" name="id" value={row.id} />
                        <ConfirmSubmit label="Remove" confirmMessage={`Remove ${row.email} from the newsletter?`} />
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
