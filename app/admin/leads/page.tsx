import { requireRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db";
import { LeadRow } from "./lead-row";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  await requireRole("EDITOR");
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const unread = leads.filter((l) => !l.read).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-2xl">Leads ({leads.length})</h2>
        {unread > 0 && (
          <span className="text-sm px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300">
            {unread} belum dibaca
          </span>
        )}
      </div>

      <div className="space-y-3">
        {leads.length === 0 && (
          <div className="card p-6 text-center text-slate-500">
            Belum ada lead masuk.
          </div>
        )}
        {leads.map((l) => (
          <LeadRow
            key={l.id}
            lead={{
              ...l,
              createdAt: l.createdAt.toISOString(),
            }}
          />
        ))}
      </div>
    </div>
  );
}