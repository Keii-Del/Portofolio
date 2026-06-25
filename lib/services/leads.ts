// Layer 12: Log + capture lead. No cache — leads are writes, fresh reads.

import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

export type LeadInput = {
  name: string;
  email: string;
  message: string;
  source?: string;
};

export async function createLead(input: LeadInput) {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null;
  const userAgent = h.get("user-agent") ?? null;

  try {
    const lead = await prisma.lead.create({
      data: {
        name: input.name,
        email: input.email,
        message: input.message,
        source: input.source ?? "contact-form",
        ip,
        userAgent,
      },
    });

    Sentry.addBreadcrumb({
      category: "lead",
      message: "new lead",
      level: "info",
      data: { id: lead.id, source: lead.source },
    });

    return lead;
  } catch (err) {
    Sentry.captureException(err, { extra: { input: { ...input, ip } } });
    throw err;
  }
}

export async function getLeads() {
  return prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
}

export async function markLeadRead(id: string, read = true) {
  return prisma.lead.update({ where: { id }, data: { read } });
}
