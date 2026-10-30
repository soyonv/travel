import { cookies } from "next/headers";
import { isLang, LANG_COOKIE, type Lang } from "@/lib/i18n";

/** Reads the language cookie. Returns English when unset. */
export async function getLang(): Promise<Lang> {
  try {
    const store = await cookies();
    const value = store.get(LANG_COOKIE)?.value;
    return isLang(value) ? value : "en";
  } catch {
    return "en";
  }
}
