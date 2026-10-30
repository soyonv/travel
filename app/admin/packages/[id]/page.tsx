import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowUpRight } from "lucide-react";
import { packages } from "@/db/schema";
import { getDbOrNull } from "@/lib/db";
import { getDestinationOptions } from "@/lib/queries";
import { deletePackageAction, savePackageAction } from "@/app/actions/admin";
import { ImageField } from "@/components/admin/editor";
import { ConfirmSubmit, SaveButton } from "@/components/admin/nav";

export const dynamic = "force-dynamic";

export default async function AdminPackageEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDbOrNull();
  if (!db) return <p className="card p-6 text-[13px] text-ink-500">The database is not connected.</p>;

  const isNew = id === "new";
  const row = isNew ? null : (await db.select().from(packages).where(eq(packages.id, id)).limit(1))[0];
  if (!isNew && !row) notFound();
  const destinationRows = await getDestinationOptions(db);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-bold text-forest-900">{isNew ? "New trip template" : row?.title}</h2>
          <p className="text-[11.5px] text-ink-400">Estimates only. Do not invent availability or verified operators.</p>
        </div>
        <div className="flex items-center gap-2">
          {row ? (
            <Link href={`/packages/${row.slug}`} className="btn btn-ghost px-3 py-1.5 text-[11.5px]">
              View page <ArrowUpRight className="size-3" aria-hidden />
            </Link>
          ) : null}
          <Link href="/admin/packages" className="text-[11.5px] font-semibold text-river-700 underline">
            Back
          </Link>
        </div>
      </div>

      <form action={savePackageAction} className="mt-4 space-y-4">
        <input type="hidden" name="id" value={row?.id ?? ""} />

        <section className="card p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="title" className="label">Title</label>
              <input id="title" name="title" required defaultValue={row?.title ?? ""} className="field" />
            </div>
            <div>
              <label htmlFor="slug" className="label">Slug</label>
              <input id="slug" name="slug" defaultValue={row?.slug ?? ""} className="field" placeholder="auto" />
            </div>
            <div>
              <label htmlFor="destinationId" className="label">Destination</label>
              <select id="destinationId" name="destinationId" defaultValue={row?.destinationId ?? ""} className="field">
                <option value="">Not linked</option>
                {destinationRows.map((destination) => (
                  <option key={destination.id} value={destination.id}>{destination.nameEn}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="durationDays" className="label">Duration (days)</label>
              <input id="durationDays" name="durationDays" type="number" min={1} max={30} required defaultValue={row?.durationDays ?? 3} className="field" />
            </div>
            <div>
              <label htmlFor="groupSize" className="label">Group size</label>
              <input id="groupSize" name="groupSize" defaultValue={row?.groupSize ?? ""} className="field" placeholder="2–8 travellers" />
            </div>
            <div>
              <label htmlFor="priceFromBdt" className="label">From (BDT, estimate)</label>
              <input id="priceFromBdt" name="priceFromBdt" type="number" min={0} step={100} defaultValue={row?.priceFromBdt ?? ""} className="field" />
            </div>
            <div>
              <label htmlFor="status" className="label">Status</label>
              <select id="status" name="status" defaultValue={row?.status ?? "draft"} className="field">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <div className="mt-3">
            <label htmlFor="summary" className="label">Summary</label>
            <textarea id="summary" name="summary" required rows={3} defaultValue={row?.summary ?? ""} className="field" />
          </div>
          <div className="mt-3">
            <label htmlFor="priceNote" className="label">Price note</label>
            <textarea id="priceNote" name="priceNote" rows={2} defaultValue={row?.priceNote ?? ""} className="field" />
          </div>
        </section>

        <section className="card p-4">
          <h3 className="text-[13px] font-bold text-forest-900">Inclusions and operations</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="includes" className="label">Included (one per line)</label>
              <textarea id="includes" name="includes" rows={5} defaultValue={(row?.includes ?? []).join("\n")} className="field" />
            </div>
            <div>
              <label htmlFor="excludes" className="label">Not included (one per line)</label>
              <textarea id="excludes" name="excludes" rows={5} defaultValue={(row?.excludes ?? []).join("\n")} className="field" />
            </div>
            <div>
              <label htmlFor="operatorName" className="label">Operator name (only if verified)</label>
              <input id="operatorName" name="operatorName" defaultValue={row?.operatorName ?? ""} className="field" />
            </div>
            <div>
              <label htmlFor="operatorContact" className="label">Operator contact</label>
              <input id="operatorContact" name="operatorContact" defaultValue={row?.operatorContact ?? ""} className="field" />
            </div>
            <div>
              <label htmlFor="operatorStatus" className="label">Operator status</label>
              <select id="operatorStatus" name="operatorStatus" defaultValue={row?.operatorStatus ?? "unverified"} className="field">
                <option value="unverified">Unverified — do not present as seller</option>
                <option value="verified">Verified with the operator</option>
              </select>
            </div>
            <div>
              <label htmlFor="availableDates" className="label">Verified dates (one per line)</label>
              <textarea id="availableDates" name="availableDates" rows={2} defaultValue={(row?.availableDates ?? []).join("\n")} className="field" placeholder="Only add dates the operator confirmed" />
            </div>
          </div>
          <div className="mt-3">
            <ImageField name="image" defaultValue={row?.image ?? ""} label="Template image" />
          </div>
        </section>

        <SaveButton label={row ? "Save template" : "Create template"} />
      </form>

      {row ? (
        <form action={deletePackageAction} className="mt-6 border-t border-ink-900/8 pt-4">
          <input type="hidden" name="id" value={row.id} />
          <ConfirmSubmit label="Delete this template" confirmMessage={`Delete ${row.title}?`} className="px-4 py-2 text-[11.5px]" />
        </form>
      ) : null}
    </div>
  );
}
