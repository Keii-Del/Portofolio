"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPost } from "./actions";

export function PostForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const res = await createPost(formData);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      const form = document.getElementById("post-create-form") as HTMLFormElement;
      form?.reset();
      router.refresh();
    });
  };

  return (
    <form id="post-create-form" action={onSubmit} className="card p-6 space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <input name="title" required placeholder="Title" className="input" />
        <input
          name="slug"
          placeholder="Slug (auto)"
          className="input"
        />
      </div>
      <textarea
        name="excerpt"
        required
        rows={2}
        placeholder="Excerpt / ringkasan singkat"
        className="input"
      />
      <textarea
        name="content"
        required
        rows={10}
        placeholder="Content (markdown)"
        className="input font-mono text-sm"
      />
      <input name="coverUrl" type="url" placeholder="Cover URL" className="input" />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="published" />
        Publish sekarang
      </label>
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          Error: {error}
        </div>
      )}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Menyimpan..." : "Publish Post"}
      </button>
    </form>
  );
}