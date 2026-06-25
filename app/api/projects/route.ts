// Layer 2: API — GET (public list), POST (admin create).

import { z } from "zod";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/lib/db";
import { checkRole } from "@/lib/auth/rbac";
import { invalidateProjects } from "@/lib/services/projects";

const createSchema = z.object({
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/, "lowercase, dash, numbers only"),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  content: z.string().max(50_000).optional(),
  tech: z.array(z.string()).max(20).default([]),
  coverUrl: z.string().url().optional().nullable(),
  demoUrl: z.string().url().optional().nullable(),
  repoUrl: z.string().url().optional().nullable(),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
});

export async function GET() {
  // Public: only published. Admin should use /api/admin/projects.
  try {
    const projects = await prisma.project.findMany({
      where: { published: true },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        tech: true,
        coverUrl: true,
        demoUrl: true,
        repoUrl: true,
        publishedAt: true,
      },
    });
    return NextResponse.json({ projects });
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const guard = await checkRole("EDITOR");
  if (!guard.ok) return guard.response;

  try {
    const body = await request.json().catch(() => null);
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "validation_failed", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const project = await prisma.project.create({
      data: {
        ...parsed.data,
        publishedAt: parsed.data.published ? new Date() : null,
      },
    });
    invalidateProjects();

    return NextResponse.json({ project }, { status: 201 });
  } catch (err) {
    Sentry.captureException(err);
    if ((err as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "slug_exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
