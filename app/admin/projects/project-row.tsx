"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@prisma/client";
import { updateProject, deleteProject } from "./actions";

type Props = { project: Project };

export function ProjectRow({ project }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onUpdate = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const res = await updateProject(project.id, formData);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setEditing(false);
      router.refresh();
    });
  };

  const onDelete = () => {
    if (!confirm(`Hapus project "${project.title}"?`)) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteProject(project.id);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  };

  if (!editing) {
    return (
      <div className="card p-5 flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-display text-lg">{project.title}</h3>
            {project.featured && (
              <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-300 border border-yellow-500/20">
                Featured
              </span>
            )}
            <span
              className={`text-xs px-2 py-0.5 rounded border ${
                project.published
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                  : "bg-slate-700/30 text-slate-400 border-slate-600/30"
              }`}
            >
              {project.published ? "Published" : "Draft"}
            </span>
          </div>
          <p className="text-sm text-slate-400 line-clamp-2 mb-2">
            {project.description}
          </p>
          <div className="text-xs text-slate-500">
            /{project.slug} · {project.tech.length} tech
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="btn-outline text-sm px-3 py-1.5"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="text-sm px-3 py-1.5 rounded-xl border border-red-500/30 text-red-300 hover:bg-red-500/10 transition disabled:opacity-50"
          >
            Hapus
          </button>
        </div>
      </div>
    );
  }

  return (
    <form action={onUpdate} className="card p-5 space-y-3">
      <input
        name="title"
        defaultValue={project.title}
        required
        className="input"
      />
      <textarea
        name="description"
        defaultValue={project.description}
        required
        rows={2}
        className="input"
      />
      <input
        name="tech"
        defaultValue={project.tech.join(", ")}
        className="input"
      />
      <div className="grid md:grid-cols-3 gap-3">
        <input
          name="coverUrl"
          defaultValue={project.coverUrl ?? ""}
          placeholder="Cover URL"
          className="input"
        />
        <input
          name="demoUrl"
          defaultValue={project.demoUrl ?? ""}
          placeholder="Demo URL"
          className="input"
        />
        <input
          name="repoUrl"
          defaultValue={project.repoUrl ?? ""}
          placeholder="Repo URL"
          className="input"
        />
      </div>
      <div className="flex gap-4 items-center text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={project.featured}
          />
          Featured
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="published"
            defaultChecked={project.published}
          />
          Published
        </label>
      </div>
      {error && <div className="text-sm text-red-300">Error: {error}</div>}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn-primary text-sm">
          {pending ? "..." : "Simpan"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="btn-outline text-sm"
        >
          Batal
        </button>
      </div>
    </form>
  );
}