import Link from "next/link";
import { Plus, Star } from "lucide-react";
import { ConfirmSubmit } from "@/components/admin/nav";
import { deleteDestinationAction } from "@/app/actions/admin";
import { getDbOrNull } from "@/lib/db";
import { getDestinations } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDestinationsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string; error?: string }>;
}) {
  const params = await searchParams;
  const db = await getDbOrNull();
  if (!db) return <p className="card p-6 text-[13px] text-ink-500">The database is not connected.</p>;

  const rows = await getDestinations(db, { limit: 100, order: "featured" });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-bold text-forest-900">Destinations</h2>
          <p className="text-[11.5px] text-ink-400">{rows.length} records. Changes are audited and revisions are kept.</p>
        </div>
        <Link href="/admin/destinations/new" className="btn btn-primary px-4 py-2 text-[12.5px]">
          <Plus className="size-3.5" aria-hidden /> New destination
        </Link>
      </div>

      {params.saved ? <p className="mt-3 rounded-lg bg-forest-50 px-3 py-2 text-[11.5px] text-forest-700">Destination saved.</p> : null}
      {params.deleted ? <p className="mt-3 rounded-lg bg-ivory-100 px-3 py-2 text-[11.5px] text-ink-600">Destination deleted.</p> : null}
      {params.error ? <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[11.5px] text-red-700">{params.error}</p> : null}

      <div className="mt-4 overflow-x-auto rounded-xl border border-ink-900/8 bg-white">
        <table className="w-full min-w-[640px] text-left text-[12px]">
          <thead className="bg-ivory-100/70 text-[10px] uppercase tracking-[0.1em] text-ink-400">
            <tr>
              <th scope="col" className="px-3 py-2.5 font-semibold">Name</th>
              <th scope="col" className="px-3 py-2.5 font-semibold">Category</th>
              <th scope="col" className="px-3 py-2.5 font-semibold">District</th>
              <th scope="col" className="px-3 py-2.5 font-semibold">Featured</th>
              <th scope="col" className="px-3 py-2.5 font-semibold">Updated</th>
              <th scope="col" className="px-3 py-2.5 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-ink-900/5">
                <td className="px-3 py-2">
                  <Link href={`/admin/destinations/${row.id}`} className="font-semibold text-forest-900 hover:underline">
                    {row.nameEn}
                  </Link>
                  <p className="text-[10.5px] text-ink-400" lang="bn">{row.nameBn}</p>
                </td>
                <td className="px-3 py-2 text-ink-600">{row.category}</td>
                <td className="px-3 py-2 text-ink-600">{row.districtName ?? "—"}</td>
                <td className="px-3 py-2">
                  {row.featured ? <Star className="size-3.5 fill-sunset-400 text-sunset-500" aria-label="Featured" /> : <span className="text-ink-400">—</span>}
                </td>
                <td className="px-3 py-2 text-[10.5px] text-ink-400">{formatDate(row.updatedAt)}</td>
                <td className="px-3 py-2 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/destinations/${row.slug}`} className="text-[10.5px] font-semibold text-river-700 underline">
                      View
                    </Link>
                    <form action={deleteDestinationAction}>
                      <input type="hidden" name="id" value={row.id} />
                      <ConfirmSubmit confirmMessage={`Delete ${row.nameEn}? Its guide will 404 immediately.`} />
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
