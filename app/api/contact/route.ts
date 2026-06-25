// Layer 2: API — POST /api/contact
// Layer 9: Rate limit (also enforced by middleware; double-check here as defense-in-depth).
// Layer 12: Log via Sentry.

import { z } from "zod";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createLead } from "@/lib/services/leads";
import { rateLimit } from "@/lib/ratelimit";

const contactSchema = z.object({
  name: z.string().trim().min(3).max(100),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(10).max(5000),
  source: z.string().max(50).optional(),
});

export async function POST(request: Request) {
  try {
    // Defense-in-depth rate limit (middleware enforces first)
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "anonymous";
    const rl = await rateLimit(ip, "/api/contact");
    if (!rl.success) {
      return NextResponse.json(
        { error: "too_many_requests" },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rl.reset - Date.now()) / 1000)),
            "X-RateLimit-Remaining": "0",
          },
        },
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "validation_failed", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const lead = await createLead(parsed.data);
    return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "method_not_allowed" }, { status: 405 });
}
