"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "./actions";

export function ProjectForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const res = await createProject(formData);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      const form = document.getElementById("project-create-form") as HTMLFormElement;
      form?.reset();
      router.refresh();
    });
  };

  return (
    <form
      id="project-create-form"
      action={onSubmit}
      className="card p-6 space-y-4"
    >
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Title *</label>
          <input name="title" required className="input" />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">
            Slug (auto dari title)
          </label>
          <input name="slug" className="input" placeholder="my-project" />
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-1">
          Description *
        </label>
        <textarea name="description" required rows={3} className="input" />
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-1">
          Content (markdown)
        </label>
        <textarea name="content" rows={5} className="input font-mono text-sm" />
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-1">
          Tech (comma-separated)
        </label>
        <input
          name="tech"
          className="input"
          placeholder="Next.js, TypeScript, PostgreSQL"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Cover URL</label>
          <input name="coverUrl" type="url" className="input" />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Demo URL</label>
          <input name="demoUrl" type="url" className="input" />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Repo URL</label>
          <input name="repoUrl" type="url" className="input" />
        </div>
      </div>

      <div className="flex gap-6 items-center">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" />
          Published
        </label>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          Error: {error}
        </div>
      )}

      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Menyimpan..." : "Tambah Project"}
      </button>
    </form>
  );
}