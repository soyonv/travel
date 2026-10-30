"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // A real deployment should forward this to an error tracker; the console keeps it visible meanwhile.
    console.error("Route error", error.digest ?? "", error.message);
  }, [error]);

  return (
    <main id="main" className="page py-16">
      <div className="mx-auto max-w-xl text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-sunset-100 text-sunset-600">
          <AlertTriangle className="size-5" aria-hidden />
        </span>
        <h1 className="display mt-4 text-[clamp(1.8rem,3.8vw,2.6rem)] text-forest-900">Something broke on this page</h1>
        <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-ink-500">
          This is our fault, not yours. The rest of the site should still work. You can retry the page, or go somewhere useful.
        </p>
        {error.digest ? <p className="mt-2 font-mono text-[10.5px] text-ink-400">Reference: {error.digest}</p> : null}

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={reset} className="btn btn-primary px-4 py-2 text-[12.5px]">
            <RotateCcw className="size-3.5" aria-hidden /> Try again
          </button>
          <Link href="/" className="btn btn-ghost px-4 py-2 text-[12.5px]">
            Home
          </Link>
          <Link href="/contact" className="btn btn-ghost px-4 py-2 text-[12.5px]">
            Report it
          </Link>
        </div>
      </div>
    </main>
  );
}
