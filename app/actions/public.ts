"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { newsletterSubscribers, inquiries } from "@/db/schema";
import { getDbOrNull } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

export type FormState = { ok: boolean; message: string; fieldErrors?: Record<string, string> };

const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  consent: z.union([z.literal("on"), z.literal("true"), z.literal("1")]).optional(),
  locale: z.enum(["en", "bn"]).optional(),
  source: z.string().max(60).optional(),
});

export async function subscribeNewsletterAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = newsletterSchema.safeParse({
    email: formData.get("email"),
    consent: formData.get("consent") ?? undefined,
    locale: formData.get("locale") ?? undefined,
    source: formData.get("source") ?? "footer",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please check the form and try again.",
      fieldErrors: { email: parsed.error.issues[0]?.message ?? "Invalid email" },
    };
  }
  if (!parsed.data.consent) {
    return { ok: false, message: "Please confirm you want to receive the newsletter." };
  }

  const headerList = await headers();
  const ip = headerList.get("cf-connecting-ip") ?? headerList.get("x-forwarded-for") ?? "local";
  const limit = await checkRateLimit(`newsletter:${ip}`, 6, 60 * 60);
  if (!limit.allowed) return { ok: false, message: "Too many attempts. Please try again later." };

  const db = await getDbOrNull();
  if (!db) return { ok: false, message: "Subscriptions are temporarily unavailable. Please try again shortly." };

  try {
    const existing = await db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, parsed.data.email))
      .limit(1);

    if (existing[0]) {
      if (existing[0].unsubscribedAt) {
        await db
          .update(newsletterSubscribers)
          .set({ unsubscribedAt: null, consentAt: new Date().toISOString() })
          .where(eq(newsletterSubscribers.id, existing[0].id));
        return { ok: true, message: "Welcome back — your subscription is active again." };
      }
      return { ok: true, message: "You're already subscribed. Nothing else to do." };
    }

    await db.insert(newsletterSubscribers).values({
      id: crypto.randomUUID(),
      email: parsed.data.email,
      locale: parsed.data.locale ?? "en",
      source: parsed.data.source ?? "footer",
      consentAt: new Date().toISOString(),
    });
    return { ok: true, message: "Subscribed. Look out for the next monthly dispatch." };
  } catch {
    return { ok: false, message: "We couldn't save that subscription. Please try again." };
  }
}

const inquirySchema = z.object({
  name: z.string().trim().min(2, "Please tell us your name.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  subject: z.string().trim().min(4, "Add a short subject.").max(160),
  message: z.string().trim().min(15, "Please add a little more detail (at least 15 characters).").max(4000),
  type: z.enum(["general", "package", "listing", "partnership", "correction", "data"]).default("general"),
});

export async function submitInquiryAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = inquirySchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    subject: formData.get("subject"),
    message: formData.get("message"),
    type: (formData.get("type") as string) || "general",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors };
  }

  const headerList = await headers();
  const ip = headerList.get("cf-connecting-ip") ?? headerList.get("x-forwarded-for") ?? "local";
  const limit = await checkRateLimit(`inquiry:${ip}`, 5, 60 * 60);
  if (!limit.allowed) return { ok: false, message: "Too many messages from this connection. Please try again later." };

  const db = await getDbOrNull();
  if (!db) return { ok: false, message: "Messages are temporarily unavailable. Email us directly instead." };

  try {
    await db.insert(inquiries).values({
      id: crypto.randomUUID(),
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      subject: parsed.data.subject,
      message: parsed.data.message,
      type: parsed.data.type,
    });
    return {
      ok: true,
      message: "Thank you — your message is with the editorial team. We aim to reply within three working days.",
    };
  } catch {
    return { ok: false, message: "We couldn't save your message. Please try again." };
  }
}
