"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updatePost, deletePost } from "./actions";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverUrl: string | null;
  published: boolean;
  publishedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export function PostRow({ post }: { post: Post }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onUpdate = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const res = await updatePost(post.id, formData);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setEditing(false);
      router.refresh();
    });
  };

  const onDelete = () => {
    if (!confirm(`Hapus post "${post.title}"?`)) return;
    startTransition(async () => {
      const res = await deletePost(post.id);
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
          <h3 className="font-display text-lg mb-1">{post.title}</h3>
          <p className="text-sm text-slate-400 line-clamp-2 mb-2">
            {post.excerpt}
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>/{post.slug}</span>
            <span>·</span>
            <span
              className={
                post.published ? "text-emerald-300" : "text-slate-500"
              }
            >
              {post.published ? "Published" : "Draft"}
            </span>
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
      <input name="title" defaultValue={post.title} required className="input" />
      <textarea
        name="excerpt"
        defaultValue={post.excerpt}
        required
        rows={2}
        className="input"
      />
      <textarea
        name="content"
        defaultValue={post.content}
        required
        rows={8}
        className="input font-mono text-sm"
      />
      <input
        name="coverUrl"
        defaultValue={post.coverUrl ?? ""}
        placeholder="Cover URL"
        className="input"
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="published"
          defaultChecked={post.published}
        />
        Published
      </label>
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