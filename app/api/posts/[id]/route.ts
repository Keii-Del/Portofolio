// Layer 2: API — blog post PATCH/DELETE.

import { z } from "zod";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/lib/db";
import { checkRole } from "@/lib/auth/rbac";
import { invalidatePosts } from "@/lib/services/posts";

const updateSchema = z
  .object({
    title: z.string().min(1).max(200),
    excerpt: z.string().min(1).max(500),
    content: z.string().min(1).max(100_000),
    coverUrl: z.string().url().nullable(),
    published: z.boolean(),
  })
  .partial();

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
      const existing = await prisma.post.findUnique({
        where: { id: params.id },
        select: { publishedAt: true },
      });
      if (!existing?.publishedAt) data.publishedAt = new Date();
    }

    const post = await prisma.post.update({
      where: { id: params.id },
      data,
    });
    invalidatePosts();
    return NextResponse.json({ post });
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
    await prisma.post.delete({ where: { id: params.id } });
    invalidatePosts();
    return NextResponse.json({ ok: true });
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
