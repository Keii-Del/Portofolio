"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/rbac";

const projectSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "lowercase, dash, numbers only"),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  content: z.string().max(50_000).optional(),
  tech: z.array(z.string()).max(20).default([]),
  coverUrl: z.string().url().optional().or(z.literal("")).optional(),
  demoUrl: z.string().url().optional().or(z.literal("")).optional(),
  repoUrl: z.string().url().optional().or(z.literal("")).optional(),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
});

export type ActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string; issues?: unknown };

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

export async function createProject(formData: FormData): Promise<ActionResult> {
  await requireRole("EDITOR");
  try {
    const raw = Object.fromEntries(formData.entries());
    const techRaw = formData.get("tech")?.toString() ?? "";
    const parsed = projectSchema.safeParse({
      ...raw,
      tech: techRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      featured: formData.get("featured") === "on",
      published: formData.get("published") === "on",
      slug: (raw.slug as string) || slugify(raw.title as string),
      coverUrl: (raw.coverUrl as string) || undefined,
      demoUrl: (raw.demoUrl as string) || undefined,
      repoUrl: (raw.repoUrl as string) || undefined,
    });

    if (!parsed.success) {
      return {
        ok: false,
        error: "validation_failed",
        issues: parsed.error.flatten(),
      };
    }

    const project = await prisma.project.create({
      data: {
        ...parsed.data,
        coverUrl: parsed.data.coverUrl || null,
        demoUrl: parsed.data.demoUrl || null,
        repoUrl: parsed.data.repoUrl || null,
        publishedAt: parsed.data.published ? new Date() : null,
      },
    });

    revalidatePath("/admin/projects");
    revalidatePath("/");
    revalidatePath("/projects");
    return { ok: true, id: project.id };
  } catch (err) {
    Sentry.captureException(err);
    if ((err as { code?: string }).code === "P2002") {
      return { ok: false, error: "slug_exists" };
    }
    return { ok: false, error: "internal_error" };
  }
}

export async function updateProject(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  await requireRole("EDITOR");
  try {
    const raw = Object.fromEntries(formData.entries());
    const techRaw = formData.get("tech")?.toString() ?? "";
    const parsed = projectSchema.partial().safeParse({
      ...raw,
      tech: techRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      featured: formData.get("featured") === "on",
      published: formData.get("published") === "on",
      coverUrl: (raw.coverUrl as string) || undefined,
      demoUrl: (raw.demoUrl as string) || undefined,
      repoUrl: (raw.repoUrl as string) || undefined,
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
      demoUrl: parsed.data.demoUrl || null,
      repoUrl: parsed.data.repoUrl || null,
    };

    if (parsed.data.published === true) {
      const existing = await prisma.project.findUnique({
        where: { id },
        select: { publishedAt: true },
      });
      if (!existing?.publishedAt) data.publishedAt = new Date();
    }

    await prisma.project.update({ where: { id }, data });
    revalidatePath("/admin/projects");
    revalidatePath("/");
    revalidatePath("/projects");
    return { ok: true, id };
  } catch (err) {
    Sentry.captureException(err);
    return { ok: false, error: "internal_error" };
  }
}

export async function deleteProject(id: string): Promise<ActionResult> {
  await requireRole("ADMIN");
  try {
    await prisma.project.delete({ where: { id } });
    revalidatePath("/admin/projects");
    revalidatePath("/");
    revalidatePath("/projects");
    return { ok: true, id };
  } catch (err) {
    Sentry.captureException(err);
    return { ok: false, error: "internal_error" };
  }
}