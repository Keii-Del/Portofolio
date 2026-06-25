import Link from "next/link";
import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { getPublishedProjects } from "@/lib/services/projects";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Projects",
  description: "Project portfolio Pandu — web development, full-stack, freelance.",
};

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();

  return (
    <section className="section pt-32">
      <div className="container-narrow">
        <Reveal>
          <h1 className="heading-display text-center mb-4">Projects</h1>
          <p className="text-slate-400 text-center mb-16 max-w-2xl mx-auto">
            Kumpulan project yang sudah dipublikasikan. Klik untuk detail
            teknologi, deskripsi, dan demo.
          </p>
        </Reveal>

        {projects.length === 0 ? (
          <Reveal>
            <div className="card p-10 text-center text-slate-500">
              Belum ada project.
            </div>
          </Reveal>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((p, i) => (
              <Reveal key={p.id} delay={i * 80}>
                <Link
                  href={`/projects/${p.slug}`}
                  className="card p-8 block hover:border-purple-500/40 hover:-translate-y-1 transition-all group"
                >
                  <div className="flex flex-wrap gap-2 mb-4">
                    {p.tech.map((t) => (
                      <span
                        key={t}
                        className="text-xs px-2 py-1 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <h2 className="font-display text-2xl mb-3 group-hover:text-purple-400 transition">
                    {p.title}
                  </h2>
                  <p className="text-slate-400 mb-4 line-clamp-3">
                    {p.description}
                  </p>
                  <div className="text-sm text-purple-400 group-hover:underline">
                    Lihat detail →
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
