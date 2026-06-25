import { requireRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db";
import { ProjectForm } from "./project-form";
import { ProjectRow } from "./project-row";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  await requireRole("EDITOR");
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-display text-2xl mb-4">Tambah Project</h2>
        <ProjectForm />
      </section>

      <section>
        <h2 className="font-display text-2xl mb-4">Daftar Project ({projects.length})</h2>
        <div className="space-y-3">
          {projects.length === 0 && (
            <div className="card p-6 text-center text-slate-500">
              Belum ada project.
            </div>
          )}
          {projects.map((p) => (
            <ProjectRow key={p.id} project={p} />
          ))}
        </div>
      </section>
    </div>
  );
}