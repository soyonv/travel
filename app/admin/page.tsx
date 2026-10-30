import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { AlertTriangle, ArrowRight, Inbox, MapPin, ShieldCheck, Users } from "lucide-react";
import {
  articles,
  attractions,
  auditLogs,
  destinations,
  districts,
  inquiries,
  listings,
  newsletterSubscribers,
  packages,
  travelAlerts,
  users,
} from "@/db/schema";
import { getDbOrNull } from "@/lib/db";
import { getBindings } from "@/lib/db";
import { isAiConfigured } from "@/lib/ai";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const db = await getDbOrNull();
  if (!db) {
    return (
      <div className="card p-6">
        <h2 className="text-[16px] font-bold text-forest-900">The database is not connected</h2>
        <p className="mt-1 text-[12.5px] text-ink-500">
          Run <code className="rounded bg-ivory-100 px-1">npm run db:migrate:local</code> and{" "}
          <code className="rounded bg-ivory-100 px-1">npm run db:seed:local</code>, then reload.
        </p>
      </div>
    );
  }

  const [
    [districtCount],
    [destinationCount],
    [attractionCount],
    [articleCount],
    [packageCount],
    [listingCount],
    [newInquiryCount],
    [subscriberCount],
    [userCount],
    [activeAlerts],
    recentInquiries,
    recentAudit,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(districts),
    db.select({ count: sql<number>`count(*)` }).from(destinations),
    db.select({ count: sql<number>`count(*)` }).from(attractions),
    db.select({ count: sql<number>`count(*)` }).from(articles),
    db.select({ count: sql<number>`count(*)` }).from(packages),
    db.select({ count: sql<number>`count(*)` }).from(listings),
    db.select({ count: sql<number>`count(*)` }).from(inquiries).where(eq(inquiries.status, "new")),
    db.select({ count: sql<number>`count(*)` }).from(newsletterSubscribers).where(sql`unsubscribed_at is null`),
    db.select({ count: sql<number>`count(*)` }).from(users),
    db.select({ count: sql<number>`count(*)` }).from(travelAlerts).where(eq(travelAlerts.active, 1)),
    db.select().from(inquiries).orderBy(desc(inquiries.createdAt)).limit(5),
    db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(8),
  ]);

  const bindings = await getBindings();
  const aiReady = isAiConfigured(bindings);

  const stats = [
    { label: "Destinations", value: destinationCount.count, href: "/admin/destinations" },
    { label: "Districts", value: districtCount.count, href: "/admin/districts" },
    { label: "Attractions", value: attractionCount.count, href: "/attractions" },
    { label: "Guides & posts", value: articleCount.count, href: "/admin/articles" },
    { label: "Trip templates", value: packageCount.count, href: "/admin/packages" },
    { label: "Directory listings", value: listingCount.count, href: "/packages#directory" },
    { label: "Users", value: userCount.count, href: "/admin/users" },
    { label: "Subscribers", value: subscriberCount.count, href: "/admin/submissions?tab=subscribers" },
  ];

  return (
    <div className="space-y-6">
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">
          Content counts
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="rounded-xl border border-ink-900/8 bg-white px-3.5 py-3 transition-shadow hover:shadow-sm"
            >
              <p className="display text-[1.7rem] leading-none text-forest-900">{Number(stat.value)}</p>
              <p className="mt-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-400">{stat.label}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Link href="/admin/submissions" className="card flex items-center gap-3 p-4 transition-shadow hover:shadow-sm">
          <span className="grid size-9 place-items-center rounded-full bg-sunset-100 text-sunset-600">
            <Inbox className="size-4" aria-hidden />
          </span>
          <div>
            <p className="text-[13px] font-bold text-forest-900">{Number(newInquiryCount.count)} new inquiries</p>
            <p className="text-[11px] text-ink-400">Reply within three working days.</p>
          </div>
          <ArrowRight className="ml-auto size-4 text-ink-400" aria-hidden />
        </Link>
        <Link href="/admin/alerts" className="card flex items-center gap-3 p-4 transition-shadow hover:shadow-sm">
          <span className="grid size-9 place-items-center rounded-full bg-river-100 text-river-700">
            <AlertTriangle className="size-4" aria-hidden />
          </span>
          <div>
            <p className="text-[13px] font-bold text-forest-900">{Number(activeAlerts.count)} active advisories</p>
            <p className="text-[11px] text-ink-400">Only publish notices you can source.</p>
          </div>
          <ArrowRight className="ml-auto size-4 text-ink-400" aria-hidden />
        </Link>
        <div className="card flex items-center gap-3 p-4">
          <span className="grid size-9 place-items-center rounded-full bg-forest-100 text-forest-700">
            <ShieldCheck className="size-4" aria-hidden />
          </span>
          <div>
            <p className="text-[13px] font-bold text-forest-900">{aiReady ? "AI is configured" : "AI key missing"}</p>
            <p className="text-[11px] text-ink-400">
              {aiReady ? "Chat and AI plans are live." : "Planner falls back to the data model."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-4" aria-labelledby="latest-inquiries">
          <div className="flex items-center justify-between">
            <h2 id="latest-inquiries" className="text-[14px] font-bold text-forest-900">
              Latest inquiries
            </h2>
            <Link href="/admin/submissions" className="text-[11px] font-semibold text-river-700 underline">
              All
            </Link>
          </div>
          {recentInquiries.length ? (
            <ul className="mt-3 divide-y divide-ink-900/5">
              {recentInquiries.map((inquiry) => (
                <li key={inquiry.id} className="py-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[12px] font-semibold text-forest-900">{inquiry.subject}</p>
                    <span className="rounded-full bg-ivory-100 px-2 py-0.5 text-[9.5px] font-bold uppercase text-ink-500">
                      {inquiry.status}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-ink-400">
                    {inquiry.name} · {inquiry.email} · {formatDate(inquiry.createdAt)}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[11px] text-ink-500">{inquiry.message}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-[12px] text-ink-400">No inquiries yet.</p>
          )}
        </section>

        <section className="card p-4" aria-labelledby="recent-audit">
          <div className="flex items-center justify-between">
            <h2 id="recent-audit" className="text-[14px] font-bold text-forest-900">
              Recent admin activity
            </h2>
            <Link href="/admin/audit" className="text-[11px] font-semibold text-river-700 underline">
              Full log
            </Link>
          </div>
          {recentAudit.length ? (
            <ul className="mt-3 space-y-2">
              {recentAudit.map((entry) => (
                <li key={entry.id} className="flex items-start gap-2 text-[11.5px]">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-forest-400" aria-hidden />
                  <span>
                    <span className="font-semibold text-ink-700">{entry.action}</span>{" "}
                    <span className="text-ink-500">{entry.detail}</span>
                    <span className="block text-[10px] text-ink-400">
                      {entry.actorEmail ?? "system"} · {formatDate(entry.createdAt)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-[12px] text-ink-400">No recorded changes yet.</p>
          )}
        </section>
      </div>

      <div className="rounded-xl border border-forest-100 bg-forest-50 px-4 py-3 text-[11.5px] leading-relaxed text-forest-700">
        <p className="flex items-center gap-1.5 font-bold">
          <MapPin className="size-3.5" aria-hidden /> Editorial standards
        </p>
        <p className="mt-1">
          Every destination and guide must cite a source and be honest about what is unverified. Do not add an operator name,
          review score, availability date or live price unless you have confirmation. Draft and review first: publishing is
          reversible, trust is not.
        </p>
        <p className="mt-1 flex items-center gap-1.5">
          <Users className="size-3" aria-hidden /> Editors can manage content; only admins can change roles.
        </p>
      </div>
    </div>
  );
}

