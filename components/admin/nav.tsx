"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFormStatus } from "react-dom";
import {
  BookOpen,
  Compass,
  FileText,
  Gauge,
  Inbox,
  LayoutGrid,
  Map,
  Mountain,
  Settings,
  ShieldCheck,
  Users,
  Loader2,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Overview", icon: Gauge },
  { href: "/admin/destinations", label: "Destinations", icon: Compass },
  { href: "/admin/districts", label: "Districts", icon: Map },
  { href: "/admin/packages", label: "Trip templates", icon: LayoutGrid },
  { href: "/admin/articles", label: "Guides & blog", icon: FileText },
  { href: "/admin/alerts", label: "Travel alerts", icon: Mountain },
  { href: "/admin/submissions", label: "Inquiries & subscribers", icon: Inbox },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/users", label: "Users & roles", icon: Users, adminOnly: true },
  { href: "/admin/audit", label: "Audit log", icon: ShieldCheck },
];

export function AdminNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin sections" className="flex flex-wrap gap-1">
      {links
        .filter((link) => !link.adminOnly || isAdmin)
        .map((link) => {
          const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-semibold transition-colors",
                active ? "bg-forest-800 text-ivory-50" : "bg-white text-ink-600 ring-1 ring-ink-900/8 hover:text-forest-800",
              )}
            >
              <link.icon className="size-3" aria-hidden />
              {link.label}
            </Link>
          );
        })}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-semibold text-river-700 underline"
      >
        <BookOpen className="size-3" aria-hidden /> View site
      </Link>
    </nav>
  );
}

export function ConfirmSubmit({
  label = "Delete",
  confirmMessage = "This cannot be undone. Delete it?",
  className,
}: {
  label?: string;
  confirmMessage?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) event.preventDefault();
      }}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50",
        className,
      )}
    >
      {pending ? <Loader2 className="size-3 animate-spin" aria-hidden /> : <Trash2 className="size-3" aria-hidden />}
      {label}
    </button>
  );
}

export function SaveButton({ label = "Save changes" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-primary px-5 text-[13px] disabled:opacity-70">
      {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      {pending ? "Saving…" : label}
    </button>
  );
}
