import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "@/db/schema";

/** Subset of the Cloudflare bindings this app relies on. */
export type Bindings = {
  DB?: unknown;
  FILES?: unknown;
  AI_API_KEY?: string;
  AI_BASE_URL?: string;
  AI_MODEL?: string;
  SESSION_SECRET?: string;
  ADMIN_BOOTSTRAP_EMAIL?: string;
  ADMIN_BOOTSTRAP_PASSWORD?: string;
  NEXT_PUBLIC_SITE_URL?: string;
  [key: string]: unknown;
};

export type Db = DrizzleD1Database<typeof schema>;

export class DatabaseUnavailableError extends Error {
  constructor(message = "The database binding is not available.") {
    super(message);
    this.name = "DatabaseUnavailableError";
  }
}

let cachedBindings: Bindings | null = null;
let cachedDb: Db | null = null;

/** Reads the Cloudflare environment (D1, R2, vars) inside a request. */
export async function getBindings(): Promise<Bindings> {
  if (cachedBindings) return cachedBindings;
  try {
    const { env } = await getCloudflareContext({ async: true });
    cachedBindings = env as unknown as Bindings;
    return cachedBindings;
  } catch {
    return {};
  }
}

export async function getDb(): Promise<Db> {
  if (cachedDb) return cachedDb;
  const bindings = await getBindings();
  if (!bindings.DB) {
    throw new DatabaseUnavailableError(
      "The D1 binding named DB is missing. Add the d1_databases binding to the Worker and run the migrations.",
    );
  }
  cachedDb = drizzle(bindings.DB as never, { schema });
  return cachedDb;
}

/** Returns null instead of throwing so pages can render setup guidance. */
export async function getDbOrNull(): Promise<Db | null> {
  try {
    return await getDb();
  } catch {
    return null;
  }
}

export function hasAiConfig(bindings: Bindings): boolean {
  return Boolean(bindings.AI_API_KEY);
}

export function aiModel(bindings: Bindings): string {
  return bindings.AI_MODEL || "@cf/meta/llama-3.1-8b-instruct";
}

export function aiBaseUrl(bindings: Bindings): string {
  return (bindings.AI_BASE_URL || "https://freebuff.com/api/v1/paid").replace(/\/$/, "");
}
