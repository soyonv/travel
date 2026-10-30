import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { AdminNav } from "@/components/admin/nav";
import { getCurrentUser, isAdmin, isStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser().catch(() => null);
  if (!user) redirect("/login?next=/admin");

  if (!isStaff(user)) {
    return (
      <div className="page py-16">
        <div className="card mx-auto max-w-lg p-7 text-center">
          <ShieldAlert className="mx-auto size-8 text-sunset-500" aria-hidden />
          <h1 className="mt-3 text-xl font-bold text-forest-900">Not your permission level</h1>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-500">
            This area is limited to editors and admins. If you should have access, ask an administrator to change your role
            on the Users page. Your role is <strong>{user.role}</strong>.
          </p>
          <Link href="/" className="btn btn-primary mt-4 px-5 text-[13px]">
            Back to the site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page py-6">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-ink-900/8 pb-4">
        <div>
          <p className="eyebrow mb-1">Back office</p>
          <h1 className="display text-[1.9rem] text-forest-900">Admin</h1>
          <p className="mt-1 text-[11.5px] text-ink-400">
            Signed in as {user.email} · role {user.role}. Every change is written to the audit log.
          </p>
        </div>
        <Link href="/account" className="btn btn-ghost px-3.5 py-1.5 text-[11.5px]">
          My account
        </Link>
      </div>

      <div className="mt-4">
        <AdminNav isAdmin={isAdmin(user)} />
      </div>

      <div className="mt-6">{children}</div>
    </div>
  );
}
