// Layer 10: Cache — unstable_cache wrapper for project queries.
// Layer 12: Log — Sentry capture on error.

import { unstable_cache, revalidateTag } from "next/cache";
import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/lib/db";
import type { Project } from "@prisma/client";

export const PROJECTS_TAG = "projects";

export async function getPublishedProjects(): Promise<Project[]> {
  return unstable_cache(
    async () => {
      try {
        return await prisma.project.findMany({
          where: { published: true },
          orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
        });
      } catch (err) {
        Sentry.captureException(err);
        return [];
      }
    },
    ["projects:published"],
    { tags: [PROJECTS_TAG], revalidate: 60 },
  )();
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return unstable_cache(
    async () => {
      try {
        return await prisma.project.findMany({
          where: { published: true, featured: true },
          orderBy: { publishedAt: "desc" },
          take: 4,
        });
      } catch (err) {
        Sentry.captureException(err);
        return [];
      }
    },
    ["projects:featured"],
    { tags: [PROJECTS_TAG], revalidate: 60 },
  )();
}

export async function getProjectBySlug(slug: string) {
  return unstable_cache(
    async () => {
      try {
        return await prisma.project.findUnique({ where: { slug } });
      } catch (err) {
        Sentry.captureException(err);
        return null;
      }
    },
    ["projects:slug", slug],
    { tags: [PROJECTS_TAG], revalidate: 60 },
  )();
}

export async function getAllProjectsAdmin() {
  // Admin: no cache, fresh data.
  return prisma.project.findMany({ orderBy: { updatedAt: "desc" } });
}

export function invalidateProjects() {
  revalidateTag(PROJECTS_TAG);
}
