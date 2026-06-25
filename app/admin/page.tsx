import Link from "next/link";
import { requireRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db";
import { signOut } from "@/lib/auth";
import { AdminNav } from "@/components/admin-nav";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  // Guard: ADMIN atau EDITOR boleh masuk
  await requireRole("EDITOR");

  // Quick stats
  const [projectCount, postCount, leadCount, unreadLeads] = await Promise.all([
    prisma.project.count(),
    prisma.post.count(),
    prisma.lead.count(),
    prisma.lead.count({ where: { read: false } }),
  ]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link href="/" className="text-sm text-purple-400 hover:text-purple-300">
            ← Lihat site
          </Link>
          <h1 className="font-display text-4xl mt-2">Dashboard</h1>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button type="submit" className="btn-outline">
            Logout
          </button>
        </form>
      </div>

      <AdminNav />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Stat label="Projects" value={projectCount} href="/admin/projects" />
        <Stat label="Posts" value={postCount} href="/admin/posts" />
        <Stat label="Total Leads" value={leadCount} href="/admin/leads" />
        <Stat
          label="Unread"
          value={unreadLeads}
          href="/admin/leads"
          highlight={unreadLeads > 0}
        />
      </div>

      <div className="card p-6 text-slate-400 text-sm">
        Pilih tab di atas untuk manage projects, posts, atau leads.
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  href,
  highlight,
}: {
  label: string;
  value: number;
  href: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`card p-5 hover:border-purple-500/40 transition ${
        highlight ? "border-purple-500/40" : ""
      }`}
    >
      <div className="text-3xl font-display mb-1">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </Link>
  );
}