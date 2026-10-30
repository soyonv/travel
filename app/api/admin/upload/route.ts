import { getBindings } from "@/lib/db";
import { requireStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

type Bucket = {
  put: (key: string, value: ArrayBuffer, options?: { httpMetadata?: { contentType?: string } }) => Promise<unknown>;
};

export async function POST(request: Request) {
  try {
    await requireStaff();
  } catch {
    return Response.json({ error: "Only editors and admins can upload media." }, { status: 403 });
  }

  const bindings = await getBindings();
  const bucket = bindings.FILES as Bucket | undefined;
  if (!bucket?.put) {
    return Response.json(
      { error: "The FILES bucket is not bound. Add the r2_buckets binding named FILES, then redeploy." },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Expected a multipart form upload." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "No file received." }, { status: 400 });
  }
  const extension = ALLOWED[file.type];
  if (!extension) {
    return Response.json({ error: "Only JPEG, PNG, WebP and AVIF images are accepted." }, { status: 415 });
  }
  if (file.size === 0 || file.size > MAX_BYTES) {
    return Response.json({ error: "Images must be between 1 byte and 4 MB." }, { status: 413 });
  }

  const key = `uploads/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;
  try {
    await bucket.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
  } catch {
    return Response.json({ error: "The upload could not be stored. Please try again." }, { status: 500 });
  }

  return Response.json(
    { url: `/api/media/${key}`, type: file.type, bytes: file.size },
    { headers: { "cache-control": "no-store" } },
  );
}
