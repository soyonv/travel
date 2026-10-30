"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import {
  announcements,
  articles,
  auditLogs,
  contentRevisions,
  destinations,
  districts,
  inquiries,
  newsletterSubscribers,
  packages,
  siteSettings,
  travelAlerts,
  users,
} from "@/db/schema";
import { getDbOrNull } from "@/lib/db";
import { isAdmin, requireStaff } from "@/lib/auth";
import { slugify } from "@/lib/utils";

const text = (value: FormDataEntryValue | null, max = 5000): string =>
  typeof value === "string" ? value.trim().slice(0, max) : "";
const num = (value: FormDataEntryValue | null): number | null => {
  const parsed = Number.parseFloat(String(value ?? ""));
  return Number.isFinite(parsed) ? parsed : null;
};
const int = (value: FormDataEntryValue | null): number | null => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : null;
};
const checked = (value: FormDataEntryValue | null): boolean => value === "on" || value === "true" || value === "1";
const imageUrl = (value: string): string | null => {
  if (!value) return null;
  if (value.startsWith("https://") || value.startsWith("/api/media/")) return value.slice(0, 600);
  return null;
};
const lines = (value: FormDataEntryValue | null, max = 40): string[] =>
  typeof value === "string"
    ? value
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, max)
    : [];

function parseSources(value: FormDataEntryValue | null): { label: string; url: string }[] {
  return lines(value, 12)
    .map((line) => {
      const [label, url] = line.split("|").map((part) => part.trim());
      if (!url || !/^https?:\/\//.test(url)) return null;
      return { label: label || url, url: url.slice(0, 500) };
    })
    .filter((entry): entry is { label: string; url: string } => Boolean(entry));
}

async function audit(
  actor: { id: string; email: string },
  action: string,
  entityType: string,
  entityId: string,
  detail: string,
) {
  const db = await getDbOrNull();
  if (!db) return;
  try {
    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      actorId: actor.id,
      actorEmail: actor.email,
      action,
      entityType,
      entityId,
      detail: detail.slice(0, 500),
      createdAt: new Date().toISOString(),
    });
  } catch {
    // Audit failures must not break the edit itself.
  }
}

async function snapshot(entityType: string, entityId: string, editorId: string, value: unknown) {
  const db = await getDbOrNull();
  if (!db) return;
  try {
    await db.insert(contentRevisions).values({
      id: crypto.randomUUID(),
      entityType,
      entityId,
      snapshot: JSON.stringify(value).slice(0, 200_000),
      editorId,
      createdAt: new Date().toISOString(),
    });
  } catch {
    // A failed revision record should not block the save.
  }
}

const destinationSchema = z.object({
  nameEn: z.string().trim().min(2, "An English name is required.").max(160),
  nameBn: z.string().trim().min(1, "A Bangla name is required.").max(160),
  region: z.string().trim().min(2).max(120),
  category: z.string().trim().min(2).max(120),
  summaryEn: z.string().trim().min(20, "Write at least one sentence.").max(600),
  descriptionMd: z.string().trim().min(50, "The description is too short.").max(40_000),
});

export async function saveDestinationAction(formData: FormData) {
  const actor = await requireStaff();
  const db = await getDbOrNull();
  if (!db) redirect("/admin?error=database");

  const parsed = destinationSchema.safeParse({
    nameEn: text(formData.get("nameEn"), 160),
    nameBn: text(formData.get("nameBn"), 160),
    region: text(formData.get("region"), 120),
    category: text(formData.get("category"), 120),
    summaryEn: text(formData.get("summaryEn"), 600),
    descriptionMd: text(formData.get("descriptionMd"), 40_000),
  });
  if (!parsed.success) redirect(`/admin/destinations?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid")}`);

  const requestedId = text(formData.get("id"), 80);
  const existing = requestedId
    ? (await db.select().from(destinations).where(eq(destinations.id, requestedId)).limit(1))[0]
    : null;
  const id = existing?.id ?? crypto.randomUUID();
  const districtId = text(formData.get("districtId"), 80) || null;
  const slug = slugify(text(formData.get("slug"), 100) || parsed.data.nameEn);

  const values = {
    slug,
    nameEn: parsed.data.nameEn,
    nameBn: parsed.data.nameBn,
    districtId,
    region: parsed.data.region,
    category: parsed.data.category,
    summaryEn: parsed.data.summaryEn,
    summaryBn: text(formData.get("summaryBn"), 600) || null,
    descriptionMd: parsed.data.descriptionMd,
    highlights: lines(formData.get("highlights"), 12),
    bestTime: text(formData.get("bestTime"), 200) || null,
    seasonalNote: text(formData.get("seasonalNote"), 600) || null,
    lat: num(formData.get("lat")),
    lon: num(formData.get("lon")),
    heroImage: imageUrl(text(formData.get("heroImage"), 600)),
    imageCredit: text(formData.get("imageCredit"), 200) || null,
    imageCreditUrl: text(formData.get("imageCreditUrl"), 600) || null,
    featured: checked(formData.get("featured")) ? 1 : 0,
    verification: text(formData.get("verification"), 40) || "seed",
    verifiedAt: text(formData.get("verifiedAt"), 40) || null,
    sources: parseSources(formData.get("sources")),
    updatedAt: new Date().toISOString(),
  };

  try {
    if (existing) {
      await snapshot("destination", id, actor.id, existing);
      await db.update(destinations).set(values).where(eq(destinations.id, id));
    } else {
      await db.insert(destinations).values({ id, ...values, createdAt: new Date().toISOString() });
    }
    await audit(actor, existing ? "destination.update" : "destination.create", "destination", id, parsed.data.nameEn);
    revalidatePath("/destinations");
    revalidatePath(`/destinations/${slug}`);
  } catch {
    redirect(`/admin/destinations?error=save-failed`);
  }
  redirect(`/admin/destinations/${id}?saved=1`);
}

export async function deleteDestinationAction(formData: FormData) {
  const actor = await requireStaff();
  const db = await getDbOrNull();
  if (!db) redirect("/admin?error=database");
  const id = text(formData.get("id"), 80);
  if (!id) redirect("/admin/destinations");
  const existing = (await db.select().from(destinations).where(eq(destinations.id, id)).limit(1))[0];
  if (existing) {
    await snapshot("destination", id, actor.id, existing);
    await db.delete(destinations).where(eq(destinations.id, id));
    await audit(actor, "destination.delete", "destination", id, existing.nameEn);
  }
  revalidatePath("/destinations");
  redirect("/admin/destinations?deleted=1");
}

const packageSchema = z.object({
  title: z.string().trim().min(4).max(160),
  summary: z.string().trim().min(20).max(800),
  durationDays: z.coerce.number().int().min(1).max(30),
});

export async function savePackageAction(formData: FormData) {
  const actor = await requireStaff();
  const db = await getDbOrNull();
  if (!db) redirect("/admin?error=database");

  const parsed = packageSchema.safeParse({
    title: text(formData.get("title"), 160),
    summary: text(formData.get("summary"), 800),
    durationDays: int(formData.get("durationDays")),
  });
  if (!parsed.success) redirect(`/admin/packages?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid")}`);

  const requestedId = text(formData.get("id"), 80);
  const existing = requestedId ? (await db.select().from(packages).where(eq(packages.id, requestedId)).limit(1))[0] : null;
  const id = existing?.id ?? crypto.randomUUID();
  const status = text(formData.get("status"), 20);
  const safeStatus = status === "published" || status === "archived" || status === "draft" ? status : "draft";

  const values = {
    slug: slugify(text(formData.get("slug"), 90) || parsed.data.title),
    title: parsed.data.title,
    destinationId: text(formData.get("destinationId"), 80) || null,
    summary: parsed.data.summary,
    durationDays: parsed.data.durationDays,
    priceFromBdt: int(formData.get("priceFromBdt")),
    priceNote: text(formData.get("priceNote"), 400) || null,
    groupSize: text(formData.get("groupSize"), 80) || null,
    includes: lines(formData.get("includes"), 15),
    excludes: lines(formData.get("excludes"), 15),
    operatorName: text(formData.get("operatorName"), 160) || null,
    operatorContact: text(formData.get("operatorContact"), 200) || null,
    operatorStatus: text(formData.get("operatorStatus"), 30) === "verified" ? "verified" : "unverified",
    availableDates: lines(formData.get("availableDates"), 12),
    image: imageUrl(text(formData.get("image"), 600)),
    status: safeStatus as "draft" | "published" | "archived",
    updatedAt: new Date().toISOString(),
  };

  try {
    if (existing) {
      await snapshot("package", id, actor.id, existing);
      await db.update(packages).set(values).where(eq(packages.id, id));
    } else {
      await db.insert(packages).values({ id, ...values, createdAt: new Date().toISOString() });
    }
    await audit(actor, existing ? "package.update" : "package.create", "package", id, parsed.data.title);
    revalidatePath("/packages");
    revalidatePath(`/packages/${values.slug}`);
  } catch {
    redirect("/admin/packages?error=save-failed");
  }
  redirect(`/admin/packages/${id}?saved=1`);
}

export async function deletePackageAction(formData: FormData) {
  const actor = await requireStaff();
  const db = await getDbOrNull();
  if (!db) redirect("/admin?error=database");
  const id = text(formData.get("id"), 80);
  const existing = id ? (await db.select().from(packages).where(eq(packages.id, id)).limit(1))[0] : null;
  if (existing) {
    await snapshot("package", id, actor.id, existing);
    await db.delete(packages).where(eq(packages.id, id));
    await audit(actor, "package.delete", "package", id, existing.title);
  }
  revalidatePath("/packages");
  redirect("/admin/packages?deleted=1");
}

const articleSchema = z.object({
  title: z.string().trim().min(6).max(200),
  excerpt: z.string().trim().min(20).max(600),
  bodyMd: z.string().trim().min(200, "The article body is too short.").max(80_000),
});

export async function saveArticleAction(formData: FormData) {
  const actor = await requireStaff();
  const db = await getDbOrNull();
  if (!db) redirect("/admin?error=database");

  const parsed = articleSchema.safeParse({
    title: text(formData.get("title"), 200),
    excerpt: text(formData.get("excerpt"), 600),
    bodyMd: text(formData.get("bodyMd"), 80_000),
  });
  if (!parsed.success) redirect(`/admin/articles?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid")}`);

  const requestedId = text(formData.get("id"), 80);
  const existing = requestedId ? (await db.select().from(articles).where(eq(articles.id, requestedId)).limit(1))[0] : null;
  const id = existing?.id ?? crypto.randomUUID();
  const type = text(formData.get("type"), 20) === "blog" ? "blog" : "guide";
  const status = text(formData.get("status"), 20);
  const safeStatus = status === "published" || status === "archived" || status === "draft" ? status : "draft";
  const words = parsed.data.bodyMd.trim().split(/\s+/).length;

  const values = {
    slug: slugify(text(formData.get("slug"), 100) || parsed.data.title),
    type: type as "guide" | "blog",
    title: parsed.data.title,
    titleBn: text(formData.get("titleBn"), 200) || null,
    excerpt: parsed.data.excerpt,
    bodyMd: parsed.data.bodyMd,
    category: text(formData.get("category"), 80) || "Guides",
    tags: lines(formData.get("tags"), 10),
    heroImage: imageUrl(text(formData.get("heroImage"), 600)),
    author: text(formData.get("author"), 120) || "Editorial team",
    destinationId: text(formData.get("destinationId"), 80) || null,
    districtId: text(formData.get("districtId"), 80) || null,
    status: safeStatus as "draft" | "published" | "archived",
    publishedAt: text(formData.get("publishedAt"), 40) || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    readingMinutes: Math.max(1, Math.round(words / 220)),
  };

  try {
    if (existing) {
      await snapshot("article", id, actor.id, existing);
      await db.update(articles).set(values).where(eq(articles.id, id));
    } else {
      await db.insert(articles).values({ id, ...values });
    }
    await audit(actor, existing ? "article.update" : "article.create", "article", id, parsed.data.title);
    revalidatePath("/travel-guides");
    revalidatePath("/blog");
    revalidatePath(`/${values.type === "guide" ? "travel-guides" : "blog"}/${values.slug}`);
  } catch {
    redirect("/admin/articles?error=save-failed");
  }
  redirect(`/admin/articles/${id}?saved=1`);
}

export async function deleteArticleAction(formData: FormData) {
  const actor = await requireStaff();
  const db = await getDbOrNull();
  if (!db) redirect("/admin?error=database");
  const id = text(formData.get("id"), 80);
  const existing = id ? (await db.select().from(articles).where(eq(articles.id, id)).limit(1))[0] : null;
  if (existing) {
    await snapshot("article", id, actor.id, existing);
    await db.delete(articles).where(eq(articles.id, id));
    await audit(actor, "article.delete", "article", id, existing.title);
  }
  revalidatePath("/travel-guides");
  revalidatePath("/blog");
  redirect("/admin/articles?deleted=1");
}

export async function saveDistrictAction(formData: FormData) {
  const actor = await requireStaff();
  const db = await getDbOrNull();
  if (!db) redirect("/admin?error=database");
  const id = text(formData.get("id"), 80);
  const existing = id ? (await db.select().from(districts).where(eq(districts.id, id)).limit(1))[0] : null;
  if (!existing) redirect("/admin/districts?error=not-found");

  const introEn = text(formData.get("introEn"), 4000);
  if (introEn.length < 60) redirect(`/admin/districts/${id}?error=short-intro`);

  try {
    await snapshot("district", id, actor.id, existing);
    await db
      .update(districts)
      .set({
        tagline: text(formData.get("tagline"), 200) || null,
        introEn,
        introBn: text(formData.get("introBn"), 4000) || null,
        bestSeason: text(formData.get("bestSeason"), 200) || null,
        dailyBudgetBdt: int(formData.get("dailyBudgetBdt")),
        transport: text(formData.get("transport"), 2000) || null,
        foods: lines(formData.get("foods"), 12),
        tips: lines(formData.get("tips"), 12),
        sources: parseSources(formData.get("sources")),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(districts.id, id));
    await audit(actor, "district.update", "district", id, existing.nameEn);
    revalidatePath(`/districts/${existing.slug}`);
  } catch {
    redirect(`/admin/districts/${id}?error=save-failed`);
  }
  redirect(`/admin/districts/${id}?saved=1`);
}

export async function saveAlertAction(formData: FormData) {
  const actor = await requireStaff();
  const db = await getDbOrNull();
  if (!db) redirect("/admin?error=database");
  const title = text(formData.get("title"), 200);
  const body = text(formData.get("body"), 2000);
  if (title.length < 4 || body.length < 10) redirect("/admin/alerts?error=invalid");
  const severity = text(formData.get("severity"), 20);

  try {
    await db.insert(travelAlerts).values({
      id: crypto.randomUUID(),
      title,
      body,
      severity: severity === "warning" || severity === "caution" ? severity : "info",
      region: text(formData.get("region"), 120) || null,
      sourceUrl: text(formData.get("sourceUrl"), 600) || null,
      sourceName: text(formData.get("sourceName"), 160) || null,
      active: 1,
      createdAt: new Date().toISOString(),
    });
    await audit(actor, "alert.create", "travel_alert", title, title);
    revalidatePath("/");
  } catch {
    redirect("/admin/alerts?error=save-failed");
  }
  redirect("/admin/alerts?saved=1");
}

export async function toggleAlertAction(formData: FormData) {
  const actor = await requireStaff();
  const db = await getDbOrNull();
  if (!db) redirect("/admin?error=database");
  const id = text(formData.get("id"), 80);
  const active = checked(formData.get("active"));
  if (id) {
    await db.update(travelAlerts).set({ active: active ? 1 : 0 }).where(eq(travelAlerts.id, id));
    await audit(actor, active ? "alert.activate" : "alert.deactivate", "travel_alert", id, "");
    revalidatePath("/");
  }
  redirect("/admin/alerts?updated=1");
}

export async function deleteAlertAction(formData: FormData) {
  const actor = await requireStaff();
  const db = await getDbOrNull();
  if (!db) redirect("/admin?error=database");
  const id = text(formData.get("id"), 80);
  if (id) {
    await db.delete(travelAlerts).where(eq(travelAlerts.id, id));
    await audit(actor, "alert.delete", "travel_alert", id, "");
    revalidatePath("/");
  }
  redirect("/admin/alerts?deleted=1");
}

export async function updateInquiryStatusAction(formData: FormData) {
  const actor = await requireStaff();
  const db = await getDbOrNull();
  if (!db) redirect("/admin?error=database");
  const id = text(formData.get("id"), 80);
  const status = text(formData.get("status"), 20);
  const allowed = ["new", "open", "closed", "spam"];
  if (id && allowed.includes(status)) {
    await db
      .update(inquiries)
      .set({ status: status as "new" | "open" | "closed" | "spam" })
      .where(eq(inquiries.id, id));
    await audit(actor, "inquiry.status", "inquiry", id, status);
  }
  redirect("/admin/submissions?tab=inquiries");
}

export async function deleteSubscriberAction(formData: FormData) {
  const actor = await requireStaff();
  const db = await getDbOrNull();
  if (!db) redirect("/admin?error=database");
  const id = text(formData.get("id"), 80);
  if (id) {
    await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.id, id));
    await audit(actor, "subscriber.delete", "newsletter", id, "");
  }
  redirect("/admin/submissions?tab=subscribers");
}

export async function saveAnnouncementAction(formData: FormData) {
  const actor = await requireStaff();
  const db = await getDbOrNull();
  if (!db) redirect("/admin?error=database");
  const messageEn = text(formData.get("messageEn"), 300);
  if (messageEn.length < 8) redirect("/admin/settings?error=invalid");
  try {
    await db.insert(announcements).values({
      id: crypto.randomUUID(),
      messageEn,
      messageBn: text(formData.get("messageBn"), 300) || null,
      link: text(formData.get("link"), 300) || null,
      active: 1,
      sort: int(formData.get("sort")) ?? 0,
      createdAt: new Date().toISOString(),
    });
    await audit(actor, "announcement.create", "announcement", messageEn, messageEn);
    revalidatePath("/");
  } catch {
    redirect("/admin/settings?error=save-failed");
  }
  redirect("/admin/settings?saved=1");
}

export async function toggleAnnouncementAction(formData: FormData) {
  const actor = await requireStaff();
  const db = await getDbOrNull();
  if (!db) redirect("/admin?error=database");
  const id = text(formData.get("id"), 80);
  const active = checked(formData.get("active"));
  if (id) {
    await db.update(announcements).set({ active: active ? 1 : 0 }).where(eq(announcements.id, id));
    await audit(actor, "announcement.toggle", "announcement", id, active ? "on" : "off");
    revalidatePath("/");
  }
  redirect("/admin/settings?updated=1");
}

export async function deleteAnnouncementAction(formData: FormData) {
  const actor = await requireStaff();
  const db = await getDbOrNull();
  if (!db) redirect("/admin?error=database");
  const id = text(formData.get("id"), 80);
  if (id) {
    await db.delete(announcements).where(eq(announcements.id, id));
    await audit(actor, "announcement.delete", "announcement", id, "");
    revalidatePath("/");
  }
  redirect("/admin/settings?deleted=1");
}

export async function saveSettingAction(formData: FormData) {
  const actor = await requireStaff();
  const db = await getDbOrNull();
  if (!db) redirect("/admin?error=database");
  const key = text(formData.get("key"), 80);
  const value = text(formData.get("value"), 4000);
  if (!key) redirect("/admin/settings?error=key");
  await db
    .insert(siteSettings)
    .values({ key, value, updatedAt: new Date().toISOString() })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date().toISOString() } });
  await audit(actor, "setting.update", "setting", key, value.slice(0, 80));
  revalidatePath("/");
  redirect("/admin/settings?updated=1");
}

export async function updateUserRoleAction(formData: FormData) {
  const actor = await requireStaff();
  if (!isAdmin(actor)) redirect("/admin?error=forbidden");
  const db = await getDbOrNull();
  if (!db) redirect("/admin?error=database");
  const id = text(formData.get("id"), 80);
  const role = text(formData.get("role"), 20);
  if (!id || !["user", "editor", "admin"].includes(role)) redirect("/admin/users?error=invalid");
  if (id === actor.id) redirect("/admin/users?error=self");

  await db.update(users).set({ role: role as "user" | "editor" | "admin", updatedAt: new Date().toISOString() }).where(eq(users.id, id));
  await audit(actor, "user.role", "user", id, role);
  redirect("/admin/users?updated=1");
}
