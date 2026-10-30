import { eq } from "drizzle-orm";
import { rateLimits } from "@/db/schema";
import { getDbOrNull } from "@/lib/db";

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export async function hashIdentifier(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].slice(0, 12).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Fixed-window limiter. Fails open when the database is unavailable so that
 * a missing binding surfaces as a setup error rather than a lockout.
 */
export async function checkRateLimit(bucket: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
  const db = await getDbOrNull();
  if (!db) return { allowed: true, remaining: limit, retryAfterSeconds: 0 };

  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - (now % windowSeconds);
  const key = bucket.slice(0, 180);

  try {
    const rows = await db.select().from(rateLimits).where(eq(rateLimits.bucket, key)).limit(1);
    const row = rows[0];

    if (!row || row.windowStart < windowStart) {
      await db
        .insert(rateLimits)
        .values({ bucket: key, count: 1, windowStart })
        .onConflictDoUpdate({ target: rateLimits.bucket, set: { count: 1, windowStart } });
      return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
    }

    if (row.count >= limit) {
      return { allowed: false, remaining: 0, retryAfterSeconds: Math.max(1, row.windowStart + windowSeconds - now) };
    }

    await db
      .update(rateLimits)
      .set({ count: row.count + 1 })
      .where(eq(rateLimits.bucket, key));
    return { allowed: true, remaining: Math.max(0, limit - row.count - 1), retryAfterSeconds: 0 };
  } catch {
    return { allowed: true, remaining: limit, retryAfterSeconds: 0 };
  }
}

export async function clientKey(request: Request, scope: string): Promise<string> {
  const headers = request.headers;
  const ip = headers.get("cf-connecting-ip") ?? headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const hashed = await hashIdentifier(ip);
  return `${scope}:${hashed}`;
}

/** Blocks cross-site form submissions to route handlers. */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // same-origin navigations may omit Origin
  try {
    const originUrl = new URL(origin);
    const host = request.headers.get("host");
    return originUrl.host === host;
  } catch {
    return false;
  }
}
