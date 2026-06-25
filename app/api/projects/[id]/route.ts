// Layer 2: API — PATCH/DELETE single project (admin).

import { z } from "zod";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/lib/db";
import { checkRole } from "@/lib/auth/rbac";
import { invalidateProjects } from "@/lib/services/projects";

const projectBase = z.object({
  slug: z.string().min(1).max(120),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  content: z.string().max(50_000).optional().nullable(),
  tech: z.array(z.string()).max(20).default([]),
  coverUrl: z.string().url().optional().nullable(),
  demoUrl: z.string().url().optional().nullable(),
  repoUrl: z.string().url().optional().nullable(),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
});

const updateSchema = projectBase.partial();

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const guard = await checkRole("EDITOR");
  if (!guard.ok) return guard.response;

  try {
    const body = await request.json().catch(() => null);
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "validation_failed", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.published === true) {
      const existing = await prisma.project.findUnique({
        where: { id: params.id },
        select: { publishedAt: true },
      });
      if (!existing?.publishedAt) data.publishedAt = new Date();
    }

    const project = await prisma.project.update({
      where: { id: params.id },
      data,
    });
    invalidateProjects();
    return NextResponse.json({ project });
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const guard = await checkRole("ADMIN");
  if (!guard.ok) return guard.response;

  try {
    await prisma.project.delete({ where: { id: params.id } });
    invalidateProjects();
    return NextResponse.json({ ok: true });
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
