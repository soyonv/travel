import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { getDbOrNull } from "@/lib/db";
import { getDistricts } from "@/lib/queries";
import { saveDistrictAction } from "@/app/actions/admin";
import { SaveButton } from "@/components/admin/nav";

export const dynamic = "force-dynamic";

export default async function AdminDistrictEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDbOrNull();
  if (!db) return <p className="card p-6 text-[13px] text-ink-500">The database is not connected.</p>;

  const all = await getDistricts(db);
  const district = all.find((entry) => entry.id === id || entry.slug === id);
  if (!district) notFound();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-bold text-forest-900">
            {district.nameEn} <span className="text-[12px] font-normal text-ink-400" lang="bn">{district.nameBn}</span>
          </h2>
          <p className="text-[11.5px] text-ink-400">{district.division} Division · /districts/{district.slug}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/districts/${district.slug}`} className="btn btn-ghost px-3 py-1.5 text-[11.5px]">
            View <ArrowUpRight className="size-3" aria-hidden />
          </Link>
          <Link href="/admin/districts" className="text-[11.5px] font-semibold text-river-700 underline">
            Back
          </Link>
        </div>
      </div>

      <form action={saveDistrictAction} className="mt-4 space-y-4">
        <input type="hidden" name="id" value={district.id} />

        <section className="card p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="tagline" className="label">Tagline</label>
              <input id="tagline" name="tagline" defaultValue={district.tagline ?? ""} className="field" />
            </div>
            <div>
              <label htmlFor="bestSeason" className="label">Best season</label>
              <input id="bestSeason" name="bestSeason" defaultValue={district.bestSeason ?? ""} className="field" />
            </div>
            <div>
              <label htmlFor="dailyBudgetBdt" className="label">Typical daily budget (BDT)</label>
              <input
                id="dailyBudgetBdt"
                name="dailyBudgetBdt"
                type="number"
                min={0}
                step={100}
                defaultValue={district.dailyBudgetBdt ?? ""}
                className="field"
              />
            </div>
            <div>
              <label htmlFor="transport" className="label">Getting there</label>
              <textarea id="transport" name="transport" rows={3} defaultValue={district.transport ?? ""} className="field" />
            </div>
          </div>
          <div className="mt-3">
            <label htmlFor="introEn" className="label">Introduction (English)</label>
            <textarea id="introEn" name="introEn" required rows={6} defaultValue={district.introEn} className="field" />
          </div>
          <div className="mt-3">
            <label htmlFor="introBn" className="label">Introduction (Bangla, optional)</label>
            <textarea id="introBn" name="introBn" rows={4} defaultValue={district.introBn ?? ""} className="field" lang="bn" />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="foods" className="label">Local food (one per line)</label>
              <textarea id="foods" name="foods" rows={6} defaultValue={(district.foods ?? []).join("\n")} className="field" />
            </div>
            <div>
              <label htmlFor="tips" className="label">Travel tips (one per line)</label>
              <textarea id="tips" name="tips" rows={6} defaultValue={(district.tips ?? []).join("\n")} className="field" />
            </div>
          </div>
          <div className="mt-3">
            <label htmlFor="sources" className="label">Sources (Label | https://url)</label>
            <textarea
              id="sources"
              name="sources"
              rows={3}
              defaultValue={(district.sources ?? []).map((source) => `${source.label} | ${source.url}`).join("\n")}
              className="field font-mono text-[11.5px]"
            />
          </div>
        </section>

        <SaveButton label="Save district" />
      </form>
    </div>
  );
}
