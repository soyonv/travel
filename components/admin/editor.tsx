"use client";

import { useRef, useState } from "react";
import { Eye, Loader2, Pencil, Upload } from "lucide-react";
import { Markdown } from "@/components/ui/markdown";
import { cn } from "@/lib/utils";

export function MarkdownEditor({
  name,
  defaultValue = "",
  label = "Body (Markdown)",
  rows = 16,
  hint,
}: {
  name: string;
  defaultValue?: string;
  label?: string;
  rows?: number;
  hint?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [tab, setTab] = useState<"write" | "preview">("write");

  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={`md-${name}`} className="label mb-0">
          {label}
        </label>
        <div className="flex rounded-full border border-ink-900/10 bg-white p-0.5">
          <button
            type="button"
            onClick={() => setTab("write")}
            aria-pressed={tab === "write"}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-semibold",
              tab === "write" ? "bg-forest-800 text-ivory-50" : "text-ink-500",
            )}
          >
            <Pencil className="size-2.5" aria-hidden /> Write
          </button>
          <button
            type="button"
            onClick={() => setTab("preview")}
            aria-pressed={tab === "preview"}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-semibold",
              tab === "preview" ? "bg-forest-800 text-ivory-50" : "text-ink-500",
            )}
          >
            <Eye className="size-2.5" aria-hidden /> Preview
          </button>
        </div>
      </div>
      {tab === "write" ? (
        <textarea
          id={`md-${name}`}
          name={name}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          rows={rows}
          className="field resize-y font-mono text-[12px] leading-relaxed"
        />
      ) : (
        <>
          <input type="hidden" name={name} value={value} />
          <div className="max-h-[520px] overflow-y-auto rounded-xl border border-ink-900/10 bg-white p-4">
            <Markdown content={value || "_Nothing to preview yet._"} />
          </div>
        </>
      )}
      <p className="mt-1 text-[10.5px] text-ink-400">
        {hint ?? "Supports ## headings, lists, links, bold, italics, quotes and tables."}
      </p>
    </div>
  );
}

export function ImageField({
  name,
  defaultValue = "",
  label = "Image",
  hint,
}: {
  name: string;
  defaultValue?: string;
  label?: string;
  hint?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) throw new Error(data.error ?? "Upload failed.");
      setValue(data.url);
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div>
      <label htmlFor={`img-${name}`} className="label">
        {label}
      </label>
      <input
        id={`img-${name}`}
        name={name}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="field text-[12px]"
        placeholder="https://… or upload a file"
      />
      <div className="mt-2 flex items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="btn btn-ghost px-3 py-1.5 text-[11px] disabled:opacity-60"
        >
          {uploading ? <Loader2 className="size-3 animate-spin" aria-hidden /> : <Upload className="size-3" aria-hidden />}
          {uploading ? "Uploading…" : "Upload"}
        </button>
        {value ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-[10.5px] text-river-700 underline">
            Open image
          </a>
        ) : null}
      </div>
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="mt-2 h-24 w-full rounded-lg border border-ink-900/10 object-cover" />
      ) : null}
      {error ? <p className="mt-1 text-[11px] text-red-700">{error}</p> : null}
      <p className="mt-1 text-[10.5px] text-ink-400">
        {hint ?? "JPEG, PNG, WebP or AVIF, up to 4 MB. Uploads go to the FILES bucket."}
      </p>
    </div>
  );
}
