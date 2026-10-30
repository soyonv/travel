import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowUpRight } from "lucide-react";
import { articles } from "@/db/schema";
import { getDbOrNull } from "@/lib/db";
import { getDestinationOptions, getDistricts } from "@/lib/queries";
import { deleteArticleAction, saveArticleAction } from "@/app/actions/admin";
import { ImageField, MarkdownEditor } from "@/components/admin/editor";
import { ConfirmSubmit, SaveButton } from "@/components/admin/nav";

export const dynamic = "force-dynamic";

export default async function AdminArticleEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDbOrNull();
  if (!db) return <p className="card p-6 text-[13px] text-ink-500">The database is not connected.</p>;

  const isNew = id === "new";
  const row = isNew ? null : (await db.select().from(articles).where(eq(articles.id, id)).limit(1))[0];
  if (!isNew && !row) notFound();

  const [destinationRows, districtRows] = await Promise.all([getDestinationOptions(db), getDistricts(db)]);
  const categories = ["Planning", "Budget", "Transport", "Safety", "Food & culture", "Photography", "Heritage", "Nature"];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-bold text-forest-900">{isNew ? "New article" : row?.title}</h2>
          <p className="text-[11.5px] text-ink-400">Markdown body, live preview, draft or published.</p>
        </div>
        <div className="flex items-center gap-2">
          {row ? (
            <Link
              href={`/${row.type === "guide" ? "travel-guides" : "blog"}/${row.slug}`}
              className="btn btn-ghost px-3 py-1.5 text-[11.5px]"
            >
              View <ArrowUpRight className="size-3" aria-hidden />
            </Link>
          ) : null}
          <Link href="/admin/articles" className="text-[11.5px] font-semibold text-river-700 underline">
            Back
          </Link>
        </div>
      </div>

      <form action={saveArticleAction} className="mt-4 space-y-4">
        <input type="hidden" name="id" value={row?.id ?? ""} />

        <section className="card p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="title" className="label">Title</label>
              <input id="title" name="title" required defaultValue={row?.title ?? ""} className="field" />
            </div>
            <div>
              <label htmlFor="titleBn" className="label">Bangla title (optional)</label>
              <input id="titleBn" name="titleBn" defaultValue={row?.titleBn ?? ""} className="field" lang="bn" />
            </div>
            <div>
              <label htmlFor="slug" className="label">Slug</label>
              <input id="slug" name="slug" defaultValue={row?.slug ?? ""} className="field" placeholder="auto" />
            </div>
            <div>
              <label htmlFor="type" className="label">Type</label>
              <select id="type" name="type" defaultValue={row?.type ?? "guide"} className="field">
                <option value="guide">Travel guide</option>
                <option value="blog">Blog post</option>
              </select>
            </div>
            <div>
              <label htmlFor="status" className="label">Status</label>
              <select id="status" name="status" defaultValue={row?.status ?? "draft"} className="field">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label htmlFor="category" className="label">Category</label>
              <input id="category" name="category" list="article-categories" defaultValue={row?.category ?? "Planning"} className="field" />
              <datalist id="article-categories">
                {categories.map((category) => <option key={category} value={category} />)}
              </datalist>
            </div>
            <div>
              <label htmlFor="author" className="label">Author</label>
              <input id="author" name="author" defaultValue={row?.author ?? "Editorial team"} className="field" />
            </div>
            <div>
              <label htmlFor="destinationId" className="label">Linked destination</label>
              <select id="destinationId" name="destinationId" defaultValue={row?.destinationId ?? ""} className="field">
                <option value="">None</option>
                {destinationRows.map((destination) => (
                  <option key={destination.id} value={destination.id}>{destination.nameEn}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="districtId" className="label">Linked district</label>
              <select id="districtId" name="districtId" defaultValue={row?.districtId ?? ""} className="field">
                <option value="">None</option>
                {districtRows.map((district) => (
                  <option key={district.id} value={district.id}>{district.nameEn}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="publishedAt" className="label">Publish date</label>
              <input id="publishedAt" name="publishedAt" type="date" defaultValue={row?.publishedAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10)} className="field" />
            </div>
            <div>
              <label htmlFor="tags" className="label">Tags (one per line)</label>
              <textarea id="tags" name="tags" rows={2} defaultValue={(row?.tags ?? []).join("\n")} className="field" />
            </div>
          </div>
          <div className="mt-3">
            <label htmlFor="excerpt" className="label">Excerpt</label>
            <textarea id="excerpt" name="excerpt" required rows={3} defaultValue={row?.excerpt ?? ""} className="field" />
          </div>
          <div className="mt-3">
            <ImageField name="heroImage" defaultValue={row?.heroImage ?? ""} label="Hero image" />
          </div>
        </section>

        <section className="card p-4">
          <MarkdownEditor name="bodyMd" defaultValue={row?.bodyMd ?? ""} rows={22} label="Article body (Markdown)" />
        </section>

        <SaveButton label={row ? "Save article" : "Create article"} />
      </form>

      {row ? (
        <form action={deleteArticleAction} className="mt-6 border-t border-ink-900/8 pt-4">
          <input type="hidden" name="id" value={row.id} />
          <ConfirmSubmit label="Delete this article" confirmMessage={`Delete “${row.title}”?`} className="px-4 py-2 text-[11.5px]" />
        </form>
      ) : null}
    </div>
  );
}
