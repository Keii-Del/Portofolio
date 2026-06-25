// Layer 12: Log — Sentry instrumentation hook.
// Next.js 14 loads this once at startup. Side-effect import = init.

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}
