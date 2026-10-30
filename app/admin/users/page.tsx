import { desc } from "drizzle-orm";
import { users } from "@/db/schema";
import { getDbOrNull } from "@/lib/db";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { updateUserRoleAction } from "@/app/actions/admin";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string; error?: string }>;
}) {
  const params = await searchParams;
  const actor = await getCurrentUser();
  if (!actor || !isAdmin(actor)) {
    return (
      <div className="card p-6">
        <h2 className="text-[16px] font-bold text-forest-900">Admins only</h2>
        <p className="mt-1 text-[12.5px] text-ink-500">Changing roles requires the admin role. Editors can manage content but not people.</p>
      </div>
    );
  }

  const db = await getDbOrNull();
  if (!db) return <p className="card p-6 text-[13px] text-ink-500">The database is not connected.</p>;
  const rows = await db.select().from(users).orderBy(desc(users.createdAt)).limit(300);

  return (
    <div>
      <h2 className="text-[17px] font-bold text-forest-900">Users and roles</h2>
      <p className="text-[11.5px] text-ink-400">
        {rows.length} accounts. Roles: user (account only), editor (content), admin (everything). You cannot change your own
        role here.
      </p>

      {params.updated ? <p className="mt-3 rounded-lg bg-forest-50 px-3 py-2 text-[11.5px] text-forest-700">Role updated.</p> : null}
      {params.error ? <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[11.5px] text-red-700">{params.error}</p> : null}

      <div className="mt-4 overflow-x-auto rounded-xl border border-ink-900/8 bg-white">
        <table className="w-full min-w-[620px] text-left text-[12px]">
          <thead className="bg-ivory-100/70 text-[10px] uppercase tracking-[0.1em] text-ink-400">
            <tr>
              <th scope="col" className="px-3 py-2.5 font-semibold">Name</th>
              <th scope="col" className="px-3 py-2.5 font-semibold">Email</th>
              <th scope="col" className="px-3 py-2.5 font-semibold">Joined</th>
              <th scope="col" className="px-3 py-2.5 font-semibold">Role</th>
              <th scope="col" className="px-3 py-2.5 text-right font-semibold">Change</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-ink-900/5">
                <td className="px-3 py-2 font-medium text-ink-700">
                  {row.name}
                  {row.id === actor.id ? <span className="ml-1.5 text-[9.5px] text-ink-400">(you)</span> : null}
                </td>
                <td className="px-3 py-2 text-ink-500">{row.email}</td>
                <td className="px-3 py-2 text-[10.5px] text-ink-400">{formatDate(row.createdAt)}</td>
                <td className="px-3 py-2">
                  <span className="rounded-full bg-ivory-100 px-2 py-0.5 text-[9.5px] font-bold uppercase text-ink-500">{row.role}</span>
                </td>
                <td className="px-3 py-2 text-right">
                  {row.id === actor.id ? (
                    <span className="text-[10px] text-ink-400">—</span>
                  ) : (
                    <form action={updateUserRoleAction} className="inline-flex items-center gap-1">
                      <input type="hidden" name="id" value={row.id} />
                      <label htmlFor={`role-${row.id}`} className="sr-only">Role for {row.name}</label>
                      <select id={`role-${row.id}`} name="role" defaultValue={row.role} className="field w-auto py-1 text-[11px]">
                        <option value="user">user</option>
                        <option value="editor">editor</option>
                        <option value="admin">admin</option>
                      </select>
                      <button type="submit" className="rounded-full border border-ink-900/10 px-2 py-1 text-[10px] font-semibold text-forest-700">
                        Apply
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 rounded-xl border border-sunset-100 bg-sunset-100/40 px-3.5 py-2.5 text-[11px] leading-relaxed text-ink-600">
        The first admin can be promoted with <code className="rounded bg-white px-1">npm run admin:create -- email name</code>{" "}
        (see the README), or by setting <code className="rounded bg-white px-1">ADMIN_BOOTSTRAP_EMAIL</code> before that person
        registers.
      </p>
    </div>
  );
}
