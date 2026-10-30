import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowUpRight } from "lucide-react";
import { destinations } from "@/db/schema";
import { getDbOrNull } from "@/lib/db";
import { getDistricts } from "@/lib/queries";
import { saveDestinationAction, deleteDestinationAction } from "@/app/actions/admin";
import { ImageField, MarkdownEditor } from "@/components/admin/editor";
import { ConfirmSubmit, SaveButton } from "@/components/admin/nav";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  "Beaches & Islands",
  "Hills & Adventure",
  "Forest & Wildlife",
  "Nature & Waterfalls",
  "History & Heritage",
  "Religious & Cultural",
  "Food & Culture",
];

export default async function AdminDestinationEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDbOrNull();
  if (!db) return <p className="card p-6 text-[13px] text-ink-500">The database is not connected.</p>;

  const isNew = id === "new";
  const row = isNew ? null : (await db.select().from(destinations).where(eq(destinations.id, id)).limit(1))[0];
  if (!isNew && !row) notFound();
  const districtRows = await getDistricts(db);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-bold text-forest-900">{isNew ? "New destination" : row?.nameEn}</h2>
          <p className="text-[11.5px] text-ink-400">
            {isNew ? "Create a record, then add sources before publishing." : `Slug: /destinations/${row?.slug}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {row ? (
            <Link href={`/destinations/${row.slug}`} className="btn btn-ghost px-3 py-1.5 text-[11.5px]">
              View page <ArrowUpRight className="size-3" aria-hidden />
            </Link>
          ) : null}
          <Link href="/admin/destinations" className="text-[11.5px] font-semibold text-river-700 underline">
            Back to list
          </Link>
        </div>
      </div>

      <form action={saveDestinationAction} className="mt-4 space-y-4">
        <input type="hidden" name="id" value={row?.id ?? ""} />

        <section className="card p-4">
          <h3 className="text-[13px] font-bold text-forest-900">Identity</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="nameEn" className="label">English name</label>
              <input id="nameEn" name="nameEn" required defaultValue={row?.nameEn ?? ""} className="field" />
            </div>
            <div>
              <label htmlFor="nameBn" className="label">Bangla name</label>
              <input id="nameBn" name="nameBn" required defaultValue={row?.nameBn ?? ""} className="field" lang="bn" />
            </div>
            <div>
              <label htmlFor="slug" className="label">Slug (optional)</label>
              <input id="slug" name="slug" defaultValue={row?.slug ?? ""} className="field" placeholder="auto from the English name" />
            </div>
            <div>
              <label htmlFor="category" className="label">Category</label>
              <select id="category" name="category" defaultValue={row?.category ?? CATEGORIES[0]} className="field">
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="region" className="label">Region</label>
              <input id="region" name="region" required defaultValue={row?.region ?? "Chattogram Division"} className="field" />
            </div>
            <div>
              <label htmlFor="districtId" className="label">District</label>
              <select id="districtId" name="districtId" defaultValue={row?.districtId ?? ""} className="field">
                <option value="">Not linked</option>
                {districtRows.map((district) => (
                  <option key={district.id} value={district.id}>{district.nameEn} — {district.division}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="card p-4">
          <h3 className="text-[13px] font-bold text-forest-900">Copy</h3>
          <div className="mt-3 space-y-3">
            <div>
              <label htmlFor="summaryEn" className="label">Summary (English)</label>
              <textarea id="summaryEn" name="summaryEn" required rows={3} defaultValue={row?.summaryEn ?? ""} className="field" />
            </div>
            <div>
              <label htmlFor="summaryBn" className="label">Summary (Bangla, optional)</label>
              <textarea id="summaryBn" name="summaryBn" rows={2} defaultValue={row?.summaryBn ?? ""} className="field" lang="bn" />
            </div>
            <MarkdownEditor name="descriptionMd" defaultValue={row?.descriptionMd ?? ""} rows={18} />
            <div>
              <label htmlFor="highlights" className="label">Highlights (one per line)</label>
              <textarea id="highlights" name="highlights" rows={5} defaultValue={(row?.highlights ?? []).join("\n")} className="field" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="bestTime" className="label">Best time</label>
                <input id="bestTime" name="bestTime" defaultValue={row?.bestTime ?? ""} className="field" />
              </div>
              <div>
                <label htmlFor="seasonalNote" className="label">Seasonal note</label>
                <input id="seasonalNote" name="seasonalNote" defaultValue={row?.seasonalNote ?? ""} className="field" />
              </div>
            </div>
          </div>
        </section>

        <section className="card p-4">
          <h3 className="text-[13px] font-bold text-forest-900">Media, location and trust</h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <ImageField name="heroImage" defaultValue={row?.heroImage ?? ""} label="Hero image" />
            <div className="space-y-3">
              <div>
                <label htmlFor="imageCredit" className="label">Image credit</label>
                <input id="imageCredit" name="imageCredit" defaultValue={row?.imageCredit ?? ""} className="field" />
              </div>
              <div>
                <label htmlFor="imageCreditUrl" className="label">Credit / licence URL</label>
                <input id="imageCreditUrl" name="imageCreditUrl" type="url" defaultValue={row?.imageCreditUrl ?? ""} className="field" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="lat" className="label">Latitude</label>
                  <input id="lat" name="lat" type="number" step="0.0001" defaultValue={row?.lat ?? ""} className="field" />
                </div>
                <div>
                  <label htmlFor="lon" className="label">Longitude</label>
                  <input id="lon" name="lon" type="number" step="0.0001" defaultValue={row?.lon ?? ""} className="field" />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="verification" className="label">Verification</label>
              <select id="verification" name="verification" defaultValue={row?.verification ?? "seed"} className="field">
                <option value="seed">Seed / unverified</option>
                <option value="verified">Verified</option>
                <option value="estimate">Estimate</option>
              </select>
            </div>
            <div>
              <label htmlFor="verifiedAt" className="label">Verified at</label>
              <input id="verifiedAt" name="verifiedAt" type="date" defaultValue={row?.verifiedAt?.slice(0, 10) ?? ""} className="field" />
            </div>
            <label className="mt-6 flex items-center gap-2 text-[12px] text-ink-700">
              <input type="checkbox" name="featured" defaultChecked={Boolean(row?.featured)} className="size-3.5 accent-forest-600" />
              Featured on the homepage
            </label>
          </div>
          <div className="mt-3">
            <label htmlFor="sources" className="label">Sources (one per line: Label | https://url)</label>
            <textarea
              id="sources"
              name="sources"
              rows={4}
              defaultValue={(row?.sources ?? []).map((source) => `${source.label} | ${source.url}`).join("\n")}
              className="field font-mono text-[11.5px]"
            />
            <p className="mt-1 text-[10.5px] text-ink-400">Only http(s) URLs are stored. A destination without sources stays labelled as seed content.</p>
          </div>
        </section>

        <div className="flex items-center gap-3">
          <SaveButton label={row ? "Save destination" : "Create destination"} />
          <span className="text-[11px] text-ink-400">Revisions keep the previous version.</span>
        </div>
      </form>

      {row ? (
        <form action={deleteDestinationAction} className="mt-6 border-t border-ink-900/8 pt-4">
          <input type="hidden" name="id" value={row.id} />
          <ConfirmSubmit
            label="Delete this destination"
            confirmMessage={`Delete ${row.nameEn}? This removes the record and its public page.`}
            className="px-4 py-2 text-[11.5px]"
          />
        </form>
      ) : null}
    </div>
  );
}
