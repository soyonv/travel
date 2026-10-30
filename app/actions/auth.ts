"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { and, eq, gt, isNull } from "drizzle-orm";
import {
  passwordResets,
  savedArticles,
  savedDestinations,
  sessions,
  tripActivities,
  tripDays,
  trips,
  users,
} from "@/db/schema";
import { getBindings, getDbOrNull } from "@/lib/db";
import {
  createSession,
  destroySession,
  getCurrentUser,
  hashPassword,
  hashToken,
  randomToken,
  validatePassword,
  verifyPassword,
} from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import { absoluteUrl } from "@/lib/utils";

export type AuthState = { ok: boolean; message: string; fieldErrors?: Record<string, string> };

const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address.").max(180);

async function ip(): Promise<string> {
  const list = await headers();
  return list.get("cf-connecting-ip") ?? list.get("x-forwarded-for") ?? "local";
}

function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  if (!next.startsWith("/") || next.startsWith("//")) return "/account";
  return next.slice(0, 200);
}

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Tell us your name.").max(120),
    email: emailSchema,
    password: z.string().min(10, "Use at least 10 characters."),
    confirm: z.string(),
    locale: z.enum(["en", "bn"]).optional(),
    consent: z.union([z.literal("on"), z.literal("true")]).optional(),
  })
  .refine((data) => data.password === data.confirm, { path: ["confirm"], message: "The passwords do not match." });

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
    locale: formData.get("locale") ?? undefined,
    consent: formData.get("consent") ?? undefined,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, message: "Please check the form and try again.", fieldErrors };
  }

  const strength = validatePassword(parsed.data.password);
  if (strength) return { ok: false, message: strength, fieldErrors: { password: strength } };

  if (!parsed.data.consent) {
    return { ok: false, message: "Please agree to the terms and privacy policy to create an account." };
  }

  const limit = await checkRateLimit(`register:${await ip()}`, 6, 60 * 60);
  if (!limit.allowed) return { ok: false, message: "Too many attempts. Please try again later." };

  const db = await getDbOrNull();
  if (!db) return { ok: false, message: "Accounts are unavailable: the database is not connected." };

  try {
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, parsed.data.email)).limit(1);
    if (existing[0]) {
      return {
        ok: false,
        message: "An account with that email already exists. Try signing in instead.",
        fieldErrors: { email: "Already registered." },
      };
    }

    const bindings = await getBindings();
    const bootstrapEmail = String(bindings.ADMIN_BOOTSTRAP_EMAIL ?? "").toLowerCase();
    const role = bootstrapEmail && bootstrapEmail === parsed.data.email ? "admin" : "user";

    const userId = crypto.randomUUID();
    await db.insert(users).values({
      id: userId,
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash: await hashPassword(parsed.data.password),
      role,
      locale: parsed.data.locale ?? "en",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await createSession(userId);
  } catch {
    return { ok: false, message: "We could not create the account. Please try again." };
  }

  redirect("/account");
}

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
});

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) {
    return { ok: false, message: "Enter your email and password.", fieldErrors: { email: parsed.error.issues[0]?.message } };
  }

  const limit = await checkRateLimit(`login:${await ip()}:${parsed.data.email}`, 10, 15 * 60);
  if (!limit.allowed) return { ok: false, message: "Too many sign-in attempts. Wait a few minutes and try again." };

  const db = await getDbOrNull();
  if (!db) return { ok: false, message: "Sign-in is unavailable: the database is not connected." };

  const rows = await db.select().from(users).where(eq(users.email, parsed.data.email)).limit(1);
  const user = rows[0];
  const valid = user ? await verifyPassword(user.passwordHash, parsed.data.password) : false;
  if (!user || !valid) {
    return { ok: false, message: "That email and password do not match. Passwords are case-sensitive." };
  }

  try {
    await createSession(user.id);
  } catch {
    return { ok: false, message: "We could not start a session. Please try again." };
  }

  redirect(safeNext(formData.get("next")));
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}

export async function requestPasswordResetAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Enter a valid email." };

  const limit = await checkRateLimit(`reset:${await ip()}`, 5, 60 * 60);
  if (!limit.allowed) return { ok: false, message: "Too many requests. Please try again later." };

  const db = await getDbOrNull();
  if (!db) return { ok: false, message: "Password reset is unavailable: the database is not connected." };

  const generic: AuthState = {
    ok: true,
    message: "If that address has an account, a reset link is on its way. It expires in one hour.",
  };

  try {
    const rows = await db.select({ id: users.id, email: users.email }).from(users).where(eq(users.email, parsed.data)).limit(1);
    const user = rows[0];
    if (!user) return generic;

    const token = randomToken(24);
    await db.insert(passwordResets).values({
      id: crypto.randomUUID(),
      userId: user.id,
      tokenHash: await hashToken(token),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    });

    const bindings = await getBindings();
    const link = absoluteUrl(`/reset-password?token=${encodeURIComponent(token)}`);
    const result = await sendEmail({
      bindings,
      to: user.email,
      subject: "Reset your Discover Bangladesh AI password",
      text: `Use this link within one hour to choose a new password:\n\n${link}\n\nIf you did not request this, ignore the email — nothing changes.`,
    });

    if (!result.sent) {
      return {
        ok: true,
        message:
          "A reset token was created, but email delivery is not configured on this deployment, so nothing was sent. An administrator needs to set RESEND_API_KEY and EMAIL_FROM; until then, reset the password from the server with the admin script.",
      };
    }
    return generic;
  } catch {
    return { ok: false, message: "We could not start the reset. Please try again." };
  }
}

const resetSchema = z
  .object({
    token: z.string().min(10).max(200),
    password: z.string().min(10, "Use at least 10 characters."),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, { path: ["confirm"], message: "The passwords do not match." });

export async function resetPasswordAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the form.", fieldErrors: { password: parsed.error.issues[0]?.message } };
  }

  const strength = validatePassword(parsed.data.password);
  if (strength) return { ok: false, message: strength, fieldErrors: { password: strength } };

  const db = await getDbOrNull();
  if (!db) return { ok: false, message: "Password reset is unavailable right now." };

  try {
    const hash = await hashToken(parsed.data.token);
    const rows = await db
      .select()
      .from(passwordResets)
      .where(and(eq(passwordResets.tokenHash, hash), isNull(passwordResets.usedAt), gt(passwordResets.expiresAt, new Date().toISOString())))
      .limit(1);
    const record = rows[0];
    if (!record) return { ok: false, message: "That reset link is invalid or has expired. Request a new one." };

    await db
      .update(users)
      .set({ passwordHash: await hashPassword(parsed.data.password), updatedAt: new Date().toISOString() })
      .where(eq(users.id, record.userId));
    await db.update(passwordResets).set({ usedAt: new Date().toISOString() }).where(eq(passwordResets.id, record.id));
    await db.delete(sessions).where(eq(sessions.userId, record.userId));
  } catch {
    return { ok: false, message: "We could not reset the password. Please try again." };
  }

  redirect("/login?reset=1");
}

export async function updateProfileAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Sign in first." };

  const parsed = z
    .object({
      name: z.string().trim().min(2, "Name must be at least two characters.").max(120),
      locale: z.enum(["en", "bn"]),
    })
    .safeParse({ name: formData.get("name"), locale: formData.get("locale") });

  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the form." };

  const db = await getDbOrNull();
  if (!db) return { ok: false, message: "Unavailable right now." };

  try {
    await db
      .update(users)
      .set({ name: parsed.data.name, locale: parsed.data.locale, updatedAt: new Date().toISOString() })
      .where(eq(users.id, user.id));
    revalidatePath("/account");
    return { ok: true, message: "Profile updated." };
  } catch {
    return { ok: false, message: "We could not update your profile." };
  }
}

export async function changePasswordAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Sign in first." };

  const parsed = z
    .object({
      current: z.string().min(1, "Enter your current password."),
      password: z.string().min(10, "Use at least 10 characters."),
      confirm: z.string(),
    })
    .refine((data) => data.password === data.confirm, { path: ["confirm"], message: "The passwords do not match." })
    .safeParse({ current: formData.get("current"), password: formData.get("password"), confirm: formData.get("confirm") });

  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the form." };

  const db = await getDbOrNull();
  if (!db) return { ok: false, message: "Unavailable right now." };

  try {
    const rows = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
    const row = rows[0];
    if (!row || !(await verifyPassword(row.passwordHash, parsed.data.current))) {
      return { ok: false, message: "The current password is not correct." };
    }
    await db
      .update(users)
      .set({ passwordHash: await hashPassword(parsed.data.password), updatedAt: new Date().toISOString() })
      .where(eq(users.id, user.id));
    await db.delete(sessions).where(eq(sessions.userId, user.id));
    await createSession(user.id);
    return { ok: true, message: "Password changed. Other sessions have been signed out." };
  } catch {
    return { ok: false, message: "We could not change the password." };
  }
}

export async function deleteAccountAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Sign in first." };

  const parsed = z
    .object({ password: z.string().min(1, "Enter your password to confirm."), confirm: z.literal("DELETE", { message: "Type DELETE to confirm." }) })
    .safeParse({ password: formData.get("password"), confirm: formData.get("confirm") });

  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the form." };

  const db = await getDbOrNull();
  if (!db) return { ok: false, message: "Unavailable right now." };

  try {
    const rows = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
    const row = rows[0];
    if (!row || !(await verifyPassword(row.passwordHash, parsed.data.password))) {
      return { ok: false, message: "That password is not correct." };
    }

    const userTrips = await db.select({ id: trips.id }).from(trips).where(eq(trips.userId, user.id));
    for (const trip of userTrips) {
      const days = await db.select({ id: tripDays.id }).from(tripDays).where(eq(tripDays.tripId, trip.id));
      for (const day of days) {
        await db.delete(tripActivities).where(eq(tripActivities.dayId, day.id));
      }
      await db.delete(tripDays).where(eq(tripDays.tripId, trip.id));
    }
    await db.delete(trips).where(eq(trips.userId, user.id));
    await db.delete(savedDestinations).where(eq(savedDestinations.userId, user.id));
    await db.delete(savedArticles).where(eq(savedArticles.userId, user.id));
    await db.delete(passwordResets).where(eq(passwordResets.userId, user.id));
    await db.delete(sessions).where(eq(sessions.userId, user.id));
    await db.delete(users).where(eq(users.id, user.id));
  } catch {
    return { ok: false, message: "We could not delete the account. Please contact support." };
  }

  redirect("/?account=deleted");
}
