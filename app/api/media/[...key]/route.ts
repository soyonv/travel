import { getBindings } from "@/lib/db";

export const dynamic = "force-dynamic";

type StoredObject = {
  body: ReadableStream;
  httpMetadata?: { contentType?: string };
  size?: number;
};

type Bucket = { get: (key: string) => Promise<StoredObject | null> };

export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const segments = (await params).key ?? [];
  const key = segments.join("/");

  if (!key.startsWith("uploads/") || key.includes("..") || key.length > 300) {
    return new Response("Not found", { status: 404 });
  }

  const bindings = await getBindings();
  const bucket = bindings.FILES as Bucket | undefined;
  if (!bucket?.get) return new Response("Media storage is not configured.", { status: 503 });

  try {
    const object = await bucket.get(key);
    if (!object) return new Response("Not found", { status: 404 });

    return new Response(object.body, {
      headers: {
        "content-type": object.httpMetadata?.contentType ?? "application/octet-stream",
        "cache-control": "public, max-age=31536000, immutable",
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return new Response("Could not read that file.", { status: 500 });
  }
}
