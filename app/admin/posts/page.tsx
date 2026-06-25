import { requireRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db";
import { PostForm } from "./post-form";
import { PostRow } from "./post-row";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  await requireRole("EDITOR");
  const posts = await prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
    include: { author: { select: { name: true, email: true } } },
  });

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-display text-2xl mb-4">Tulis Post</h2>
        <PostForm />
      </section>

      <section>
        <h2 className="font-display text-2xl mb-4">Daftar Post ({posts.length})</h2>
        <div className="space-y-3">
          {posts.length === 0 && (
            <div className="card p-6 text-center text-slate-500">Belum ada post.</div>
          )}
          {posts.map((p) => (
            <PostRow
              key={p.id}
              post={{
                ...p,
                publishedAt: p.publishedAt?.toISOString() ?? null,
                createdAt: p.createdAt.toISOString(),
                updatedAt: p.updatedAt.toISOString(),
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}