// Layer 13: Health check — liveness + DB ping.
// Used by UptimeRobot + Vercel monitoring.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const startedAt = Date.now();
  const checks = {
    db: { ok: false, latencyMs: 0 },
    app: { ok: true, version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local" },
  };

  try {
    const t0 = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.db = { ok: true, latencyMs: Date.now() - t0 };
  } catch {
    checks.db = { ok: false, latencyMs: 0 };
  }

  const allOk = checks.db.ok && checks.app.ok;
  return NextResponse.json(
    {
      status: allOk ? "ok" : "degraded",
      checks,
      uptimeMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    },
    { status: allOk ? 200 : 503 },
  );
}
