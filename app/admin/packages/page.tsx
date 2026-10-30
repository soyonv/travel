import Link from "next/link";
import { Plus } from "lucide-react";
import { desc } from "drizzle-orm";
import { packages } from "@/db/schema";
import { ConfirmSubmit } from "@/components/admin/nav";
import { deletePackageAction } from "@/app/actions/admin";
import { getDbOrNull } from "@/lib/db";
import { formatBDT } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string; error?: string }>;
}) {
  const params = await searchParams;
  const db = await getDbOrNull();
  if (!db) return <p className="card p-6 text-[13px] text-ink-500">The database is not connected.</p>;

  const rows = await db.select().from(packages).orderBy(desc(packages.updatedAt));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-bold text-forest-900">Trip templates</h2>
          <p className="text-[11.5px] text-ink-400">
            {rows.length} templates. Only published ones appear on the site. Never list an operator as verified without a check.
          </p>
        </div>
        <Link href="/admin/packages/new" className="btn btn-primary px-4 py-2 text-[12.5px]">
          <Plus className="size-3.5" aria-hidden /> New template
        </Link>
      </div>

      {params.saved ? <p className="mt-3 rounded-lg bg-forest-50 px-3 py-2 text-[11.5px] text-forest-700">Template saved.</p> : null}
      {params.deleted ? <p className="mt-3 rounded-lg bg-ivory-100 px-3 py-2 text-[11.5px] text-ink-600">Template deleted.</p> : null}
      {params.error ? <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[11.5px] text-red-700">{params.error}</p> : null}

      <div className="mt-4 overflow-x-auto rounded-xl border border-ink-900/8 bg-white">
        <table className="w-full min-w-[620px] text-left text-[12px]">
          <thead className="bg-ivory-100/70 text-[10px] uppercase tracking-[0.1em] text-ink-400">
            <tr>
              <th scope="col" className="px-3 py-2.5 font-semibold">Title</th>
              <th scope="col" className="px-3 py-2.5 font-semibold">Days</th>
              <th scope="col" className="px-3 py-2.5 font-semibold">From</th>
              <th scope="col" className="px-3 py-2.5 font-semibold">Operator</th>
              <th scope="col" className="px-3 py-2.5 font-semibold">Status</th>
              <th scope="col" className="px-3 py-2.5 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-ink-900/5">
                <td className="px-3 py-2">
                  <Link href={`/admin/packages/${row.id}`} className="font-semibold text-forest-900 hover:underline">
                    {row.title}
                  </Link>
                </td>
                <td className="px-3 py-2 text-ink-600">{row.durationDays}</td>
                <td className="px-3 py-2 text-ink-600">{row.priceFromBdt ? formatBDT(row.priceFromBdt) : "—"}</td>
                <td className="px-3 py-2 text-ink-600">
                  {row.operatorName ?? "Not set"}{" "}
                  <span className={row.operatorStatus === "verified" ? "text-forest-700" : "text-sunset-600"}>
                    ({row.operatorStatus})
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span className="rounded-full bg-ivory-100 px-2 py-0.5 text-[9.5px] font-bold uppercase text-ink-500">
                    {row.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/packages/${row.slug}`} className="text-[10.5px] font-semibold text-river-700 underline">
                      View
                    </Link>
                    <form action={deletePackageAction}>
                      <input type="hidden" name="id" value={row.id} />
                      <ConfirmSubmit confirmMessage={`Delete ${row.title}?`} />
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
