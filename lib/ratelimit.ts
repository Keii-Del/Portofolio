// Layer 9: Rate limiting — Upstash Redis sliding window.
// Free tier: 10k commands/day, 256 MB storage.

import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redis = Redis.fromEnv();

type Bucket = "contact" | "auth" | "admin";

const limiters: Record<Bucket, Ratelimit> = {
  contact: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
    prefix: "rl:contact",
    analytics: true,
  }),
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    prefix: "rl:auth",
    analytics: true,
  }),
  admin: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "1 m"),
    prefix: "rl:admin",
    analytics: true,
  }),
};

function pickBucket(path: string): Bucket {
  if (path.startsWith("/api/auth")) return "auth";
  if (path.startsWith("/api/contact")) return "contact";
  if (path.startsWith("/api/admin")) return "admin";
  return "contact";
}

/**
 * Rate limit by IP+path.
 * Returns { success, remaining, reset, limit }.
 * Falls back to allow jika Upstash env belum di-set (dev mode).
 */
export async function rateLimit(
  identifier: string,
  path: string,
): Promise<{ success: boolean; remaining: number; reset: number; limit: number }> {
  // Dev fallback: kalau env belum ada, izinkan semua (log warn sekali).
  if (!process.env.UPSTASH_REDIS_REST_URL) {
    if (process.env.NODE_ENV === "production") {
      console.warn("[ratelimit] UPSTASH env missing in production — ALLOWING ALL (unsafe)");
    }
    return { success: true, remaining: 999, reset: Date.now() + 60_000, limit: 999 };
  }

  const bucket = pickBucket(path);
  const res = await limiters[bucket].limit(`${bucket}:${identifier}`);
  return {
    success: res.success,
    remaining: res.remaining,
    reset: res.reset,
    limit: res.limit,
  };
}
