// Layer 4 + 8 + 9: Edge middleware
// - Auth check untuk /admin/* (redirect ke /login kalau belum)
// - Rate limit untuk /api/contact, /api/auth/* (sliding window via Upstash)
//
// Edge-safe: pakai NextAuth dari authConfig (no bcrypt import).
// bcryptjs import di lib/auth/index.ts → kena edge kalau dipakai di middleware.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/config";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const path = nextUrl.pathname;

  // --- Auth gate: /admin/* (skip /admin/login) ---
  if (path.startsWith("/admin") && path !== "/admin/login") {
    if (!isLoggedIn) {
      const loginUrl = new URL("/admin/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(loginUrl);
    }
  }

  // --- Rate limit gate: /api/contact, /api/auth/*
  // Upstash REST works on edge runtime (HTTP-based, not TCP).
  if (path === "/api/contact" || path.startsWith("/api/auth/")) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "anonymous";

    const rl = await rateLimitEdge(ip, path);
    if (!rl.success) {
      return new NextResponse(
        JSON.stringify({ error: "too_many_requests" }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil((rl.reset - Date.now()) / 1000)),
            "X-RateLimit-Remaining": "0",
          },
        },
      );
    }
    const res = NextResponse.next();
    res.headers.set("X-RateLimit-Remaining", String(rl.remaining));
    return res;
  }

  return NextResponse.next();
});

// Matcher: skip static, _next, favicon.
export const config = {
  matcher: [
    "/admin/:path*",
    "/api/contact",
    "/api/auth/:path*",
  ],
};

// ============================================
// Edge-safe rate limiter (Upstash REST, no Node.js imports)
// ============================================
type RLResult = {
  success: boolean;
  remaining: number;
  reset: number;
  limit: number;
};

async function rateLimitEdge(identifier: string, path: string): Promise<RLResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    if (process.env.NODE_ENV === "production") {
      console.warn("[ratelimit] UPSTASH env missing in production");
    }
    return { success: true, remaining: 999, reset: Date.now() + 60_000, limit: 999 };
  }

  // Sliding window approximation via fixed-window using Redis INCR + EXPIRE.
  // Simpler & edge-safe than @upstash/ratelimit (which uses Node.js Redis).
  const bucket = path.startsWith("/api/auth") ? "auth" : "contact";
  const windowSec = 60;
  const limit = bucket === "auth" ? 10 : 5;
  const key = `rl:${bucket}:${identifier}:${Math.floor(Date.now() / 1000 / windowSec)}`;

  try {
    const incrRes = await fetch(`${url}/incr/${key}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!incrRes.ok) throw new Error(`Upstash ${incrRes.status}`);
    const data = (await incrRes.json()) as { result: number };

    // Set expiry on first hit
    if (data.result === 1) {
      await fetch(`${url}/expire/${key}/${windowSec}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    const remaining = Math.max(0, limit - data.result);
    const reset = Math.ceil(Date.now() / 1000 / windowSec) * windowSec * 1000;
    return {
      success: data.result <= limit,
      remaining,
      reset,
      limit,
    };
  } catch (err) {
    // Fail-open: kalau Upstash down, izinkan (better than blocking legitimate users).
    console.error("[ratelimit] edge failure", err);
    return { success: true, remaining: limit, reset: Date.now() + 60_000, limit };
  }
}
