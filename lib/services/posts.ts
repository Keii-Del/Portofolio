// Layer 10 + 12: Cache + log wrapper for blog posts.

import { unstable_cache, revalidateTag } from "next/cache";
import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/lib/db";

export const POSTS_TAG = "posts";

export async function getPublishedPosts() {
  return unstable_cache(
    async () => {
      try {
        return await prisma.post.findMany({
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
      } catch (err) {
        Sentry.captureException(err);
        return [];
      }
    },
    ["posts:published"],
    { tags: [POSTS_TAG], revalidate: 60 },
  )();
}

export async function getPostBySlug(slug: string) {
  return unstable_cache(
    async () => {
      try {
        return await prisma.post.findUnique({ where: { slug } });
      } catch (err) {
        Sentry.captureException(err);
        return null;
      }
    },
    ["posts:slug", slug],
    { tags: [POSTS_TAG], revalidate: 60 },
  )();
}

export async function getAllPostsAdmin() {
  return prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
    include: { author: { select: { name: true, email: true } } },
  });
}

export function invalidatePosts() {
  revalidateTag(POSTS_TAG);
}
