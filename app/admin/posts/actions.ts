"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/rbac";
import type { ActionResult } from "../projects/actions";

const postSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9-]+$/, "lowercase, dash, numbers only"),
  title: z.string().min(1).max(200),
  excerpt: z.string().min(1).max(500),
  content: z.string().min(1).max(100_000),
  coverUrl: z.string().url().optional().or(z.literal("")),
  published: z.boolean().default(false),
});

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 160);
}

export async function createPost(formData: FormData): Promise<ActionResult> {
  const user = await requireRole("EDITOR");
  try {
    const raw = Object.fromEntries(formData.entries());
    const parsed = postSchema.safeParse({
      ...raw,
      published: formData.get("published") === "on",
      slug: (raw.slug as string) || slugify(raw.title as string),
      coverUrl: (raw.coverUrl as string) || undefined,
    });
    if (!parsed.success) {
      return {
        ok: false,
        error: "validation_failed",
        issues: parsed.error.flatten(),
      };
    }
    const post = await prisma.post.create({
      data: {
        ...parsed.data,
        coverUrl: parsed.data.coverUrl || null,
        authorId: user.id,
        publishedAt: parsed.data.published ? new Date() : null,
      },
    });
    revalidatePath("/admin/posts");
    revalidatePath("/blog");
    return { ok: true, id: post.id };
  } catch (err) {
    Sentry.captureException(err);
    if ((err as { code?: string }).code === "P2002") {
      return { ok: false, error: "slug_exists" };
    }
    return { ok: false, error: "internal_error" };
  }
}

export async function updatePost(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  await requireRole("EDITOR");
  try {
    const raw = Object.fromEntries(formData.entries());
    const parsed = postSchema.partial().safeParse({
      ...raw,
      published: formData.get("published") === "on",
      coverUrl: (raw.coverUrl as string) || undefined,
    });
    if (!parsed.success) {
      return {
        ok: false,
        error: "validation_failed",
        issues: parsed.error.flatten(),
      };
    }
    const data: Record<string, unknown> = {
      ...parsed.data,
      coverUrl: parsed.data.coverUrl || null,
    };
    if (parsed.data.published === true) {
      const existing = await prisma.post.findUnique({
        where: { id },
        select: { publishedAt: true },
      });
      if (!existing?.publishedAt) data.publishedAt = new Date();
    }
    await prisma.post.update({ where: { id }, data });
    revalidatePath("/admin/posts");
    revalidatePath("/blog");
    return { ok: true, id };
  } catch (err) {
    Sentry.captureException(err);
    return { ok: false, error: "internal_error" };
  }
}

export async function deletePost(id: string): Promise<ActionResult> {
  await requireRole("ADMIN");
  try {
    await prisma.post.delete({ where: { id } });
    revalidatePath("/admin/posts");
    revalidatePath("/blog");
    return { ok: true, id };
  } catch (err) {
    Sentry.captureException(err);
    return { ok: false, error: "internal_error" };
  }
}