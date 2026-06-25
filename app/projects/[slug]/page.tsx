import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { getProjectBySlug } from "@/lib/services/projects";

export const revalidate = 60;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug);
  if (!project) return { title: "Project tidak ditemukan" };
  return {
    title: project.title,
    description: project.description,
    openGraph: { title: project.title, description: project.description },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const project = await getProjectBySlug(params.slug);
  if (!project) notFound();

  return (
    <article className="section pt-32">
      <div className="container-narrow max-w-4xl">
        <Reveal>
          <Link
            href="/projects"
            className="text-sm text-purple-400 hover:text-purple-300 mb-8 inline-block"
          >
            ← Kembali ke Projects
          </Link>

          <h1 className="heading-display mb-6">{project.title}</h1>

          <div className="flex flex-wrap gap-2 mb-8">
            {project.tech.map((t) => (
              <span
                key={t}
                className="text-xs px-3 py-1 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20"
              >
                {t}
              </span>
            ))}
          </div>

          <p className="text-xl text-slate-300 leading-relaxed mb-8">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-4 mb-12">
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Live Demo
              </a>
            )}
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
              >
                Source Code
              </a>
            )}
          </div>
        </Reveal>

        {project.content && (
          <Reveal delay={100}>
            <div className="card p-8 prose prose-invert prose-purple max-w-none">
              <pre className="whitespace-pre-wrap font-body text-slate-300 leading-relaxed">
                {project.content}
              </pre>
            </div>
          </Reveal>
        )}
      </div>
    </article>
  );
}
