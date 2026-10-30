import type { ReactNode } from "react";
import Link from "next/link";
import { ShieldCheck, Sparkles } from "lucide-react";

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main id="main" className="page py-10">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <aside className="hidden rounded-[26px] bg-forest-950 p-8 text-ivory-100 lg:block">
          <p className="eyebrow mb-3 text-sunset-400">An optional account</p>
          <h2 className="display text-[2rem] leading-tight text-ivory-50">Keep the trips, not the tabs.</h2>
          <p className="mt-3 text-[13.5px] leading-relaxed text-ivory-200/75">
            Browsing never needs an account. Signing in only adds a place to keep your itineraries, saved places and
            reading list — and to take it all with you.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              { icon: Sparkles, text: "Save AI itineraries and edit them later" },
              { icon: ShieldCheck, text: "Export or delete everything in a few clicks" },
              { icon: Sparkles, text: "Share a read-only itinerary when you choose" },
            ].map((item) => (
              <li key={item.text} className="flex items-start gap-2.5 text-[13px] text-ivory-200/85">
                <item.icon className="mt-0.5 size-3.5 shrink-0 text-sunset-400" aria-hidden />
                {item.text}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-[10.5px] leading-relaxed text-ivory-200/40">
            No marketing email is sent to account holders unless they separately subscribe. Passwords are hashed with
            PBKDF2-SHA256 and sessions are HTTP-only cookies.
          </p>
        </aside>

        <div className="card p-6 sm:p-8">
          <p className="eyebrow mb-2">{eyebrow}</p>
          <h1 className="display text-[clamp(1.8rem,3.5vw,2.5rem)] text-forest-900">{title}</h1>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-500">{description}</p>
          <div className="mt-5">{children}</div>
          {footer ? <div className="mt-5 border-t border-ink-900/8 pt-4">{footer}</div> : null}
          <p className="mt-4 text-[10.5px] leading-relaxed text-ink-400">
            By continuing you agree to the{" "}
            <Link href="/terms" className="underline">
              terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline">
              privacy policy
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
