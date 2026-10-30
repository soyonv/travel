import Link from "next/link";
import { getDbOrNull } from "@/lib/db";
import { getDistrictAttractionCounts, getDistricts } from "@/lib/queries";
import { formatBDT } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDistrictsPage() {
  const db = await getDbOrNull();
  if (!db) return <p className="card p-6 text-[13px] text-ink-500">The database is not connected.</p>;

  const [rows, counts] = await Promise.all([getDistricts(db), getDistrictAttractionCounts(db)]);

  return (
    <div>
      <h2 className="text-[17px] font-bold text-forest-900">Districts</h2>
      <p className="text-[11.5px] text-ink-400">
        {rows.length} districts. Edit intros, food, transport, tips and sources. Attractions are generated partly from
        destination and district content, so keep the copy accurate.
      </p>

      <div className="mt-4 overflow-x-auto rounded-xl border border-ink-900/8 bg-white">
        <table className="w-full min-w-[560px] text-left text-[12px]">
          <thead className="bg-ivory-100/70 text-[10px] uppercase tracking-[0.1em] text-ink-400">
            <tr>
              <th scope="col" className="px-3 py-2.5 font-semibold">District</th>
              <th scope="col" className="px-3 py-2.5 font-semibold">Division</th>
              <th scope="col" className="px-3 py-2.5 font-semibold">Attractions</th>
              <th scope="col" className="px-3 py-2.5 font-semibold">Daily budget</th>
              <th scope="col" className="px-3 py-2.5 text-right font-semibold">Edit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-ink-900/5">
                <td className="px-3 py-2">
                  <Link href={`/admin/districts/${row.id}`} className="font-semibold text-forest-900 hover:underline">
                    {row.nameEn}
                  </Link>
                  <span className="ml-2 text-[10.5px] text-ink-400" lang="bn">{row.nameBn}</span>
                </td>
                <td className="px-3 py-2 text-ink-600">{row.division}</td>
                <td className="px-3 py-2 text-ink-600">{counts.get(row.id) ?? 0}</td>
                <td className="px-3 py-2 text-ink-600">{row.dailyBudgetBdt ? formatBDT(row.dailyBudgetBdt) : "—"}</td>
                <td className="px-3 py-2 text-right">
                  <Link href={`/admin/districts/${row.id}`} className="text-[10.5px] font-semibold text-river-700 underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
