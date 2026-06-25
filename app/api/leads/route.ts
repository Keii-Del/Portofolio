// Layer 2: API — leads (admin only).

import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/lib/db";
import { checkRole } from "@/lib/auth/rbac";

export async function GET() {
  const guard = await checkRole("EDITOR");
  if (!guard.ok) return guard.response;

  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return NextResponse.json({ leads });
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const guard = await checkRole("EDITOR");
  if (!guard.ok) return guard.response;

  try {
    const { id, read } = (await request.json().catch(() => ({}))) as {
      id?: string;
      read?: boolean;
    };
    if (!id) {
      return NextResponse.json({ error: "id_required" }, { status: 400 });
    }
    const lead = await prisma.lead.update({
      where: { id },
      data: { read: !!read },
    });
    return NextResponse.json({ lead });
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
