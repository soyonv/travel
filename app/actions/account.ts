"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { savedArticles, savedDestinations } from "@/db/schema";
import { getDbOrNull } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export type SaveResult = { ok: boolean; saved: boolean; message: string; requiresAuth?: boolean };

export async function toggleSavedDestination(destinationId: string): Promise<SaveResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, saved: false, message: "Sign in to save places.", requiresAuth: true };

  const db = await getDbOrNull();
  if (!db) return { ok: false, saved: false, message: "Saving is unavailable right now." };

  const key = destinationId.slice(0, 80);
  try {
    const existing = await db
      .select()
      .from(savedDestinations)
      .where(and(eq(savedDestinations.userId, user.id), eq(savedDestinations.destinationId, key)))
      .limit(1);

    if (existing[0]) {
      await db
        .delete(savedDestinations)
        .where(and(eq(savedDestinations.userId, user.id), eq(savedDestinations.destinationId, key)));
      revalidatePath("/account");
      return { ok: true, saved: false, message: "Removed from your saved places." };
    }

    await db.insert(savedDestinations).values({ userId: user.id, destinationId: key });
    revalidatePath("/account");
    return { ok: true, saved: true, message: "Saved to your account." };
  } catch {
    return { ok: false, saved: false, message: "We could not update your saved places." };
  }
}

export async function toggleSavedArticle(articleId: string): Promise<SaveResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, saved: false, message: "Sign in to save guides.", requiresAuth: true };

  const db = await getDbOrNull();
  if (!db) return { ok: false, saved: false, message: "Saving is unavailable right now." };

  const key = articleId.slice(0, 80);
  try {
    const existing = await db
      .select()
      .from(savedArticles)
      .where(and(eq(savedArticles.userId, user.id), eq(savedArticles.articleId, key)))
      .limit(1);

    if (existing[0]) {
      await db.delete(savedArticles).where(and(eq(savedArticles.userId, user.id), eq(savedArticles.articleId, key)));
      revalidatePath("/account");
      return { ok: true, saved: false, message: "Removed from your reading list." };
    }

    await db.insert(savedArticles).values({ userId: user.id, articleId: key });
    revalidatePath("/account");
    return { ok: true, saved: true, message: "Saved to your reading list." };
  } catch {
    return { ok: false, saved: false, message: "We could not update your reading list." };
  }
}
