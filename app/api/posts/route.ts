// Layer 2: API — blog posts GET (public) + POST (admin).

import { z } from "zod";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/lib/db";
import { checkRole } from "@/lib/auth/rbac";
import { invalidatePosts } from "@/lib/services/posts";

const postSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9-]+$/, "lowercase, dash, numbers only"),
  title: z.string().min(1).max(200),
  excerpt: z.string().min(1).max(500),
  content: z.string().min(1).max(100_000),
  coverUrl: z.string().url().optional().nullable(),
  published: z.boolean().default(false),
});

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverUrl: true,
        publishedAt: true,
      },
    });
    return NextResponse.json({ posts });
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
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "validation_failed", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const post = await prisma.post.create({
      data: {
        ...parsed.data,
        authorId: guard.user.id,
        publishedAt: parsed.data.published ? new Date() : null,
      },
    });
    invalidatePosts();

    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    Sentry.captureException(err);
    if ((err as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "slug_exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
