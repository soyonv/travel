"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { toggleSavedDestination, toggleSavedArticle } from "@/app/actions/account";
import { cn } from "@/lib/utils";

export function SaveButton({
  id,
  kind,
  initialSaved = false,
  label = "Save",
  className,
}: {
  id: string;
  kind: "destination" | "article";
  initialSaved?: boolean;
  label?: string;
  className?: string;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className={cn("inline-flex flex-col items-start gap-1", className)}>
      <button
        type="button"
        className={cn("btn px-4 py-2 text-[12.5px]", saved ? "btn-primary" : "btn-ghost")}
        aria-pressed={saved}
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result =
              kind === "destination" ? await toggleSavedDestination(id) : await toggleSavedArticle(id);
            if (result.requiresAuth) {
              router.push(`/login?next=${encodeURIComponent(pathname)}`);
              return;
            }
            setError(!result.ok);
            setMessage(result.message);
            if (result.ok) setSaved(result.saved);
          })
        }
      >
        {pending ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
        ) : saved ? (
          <BookmarkCheck className="size-3.5" aria-hidden />
        ) : (
          <Bookmark className="size-3.5" aria-hidden />
        )}
        {saved ? "Saved" : label}
      </button>
      {message ? (
        <span aria-live="polite" className={cn("text-[11px]", error ? "text-red-700" : "text-ink-400")}>
          {message}
        </span>
      ) : null}
    </div>
  );
}
