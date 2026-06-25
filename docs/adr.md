# Architecture Decisions Record (ADR)

## 2026-06-24 — Initial Stack

### Context
Solo developer (Pandu, mahasiswa) mau portofolio production-grade untuk showcase ke client freelance + rekrueter. Budget $0.

### Decision
- **Next.js 14 App Router** — unified frontend + API, server-first, Vercel-native.
- **Neon Postgres** — free tier Postgres 0.5 GB, PITR included.
- **Vercel** — free hobby plan, serverless + edge, auto-scaling.
- **Auth.js v5** — self-hosted auth, no vendor lock-in.
- **Upstash Redis** — rate limiting, free 10k req/day.
- **Sentry** — error tracking, free 5k events/mo.
- **Vercel Blob** — file storage, free 500 MB.

### Alternatives considered
- **Astro + Cloudflare Pages** — lebih murah bandwidth, tapi auth lebih susah, ekosistem lebih kecil.
- **Express + React SPA** — lebih banyak kontrol, tapi setup 2 service, double deploy.
- **Supabase** — menarik (auth+DB+storage bundle), tapi lock-in tinggi.

### Trade-offs
- Vercel vendor lock-in (serverless, edge functions specific)
- Free tier limits: harus monitor usage, optimize kalau traffic naik
- Sentry free: 5k events cukup untuk portfolio traffic normal

### Reversibility
Semua service bisa diganti:
- DB → swap Prisma datasource
- Auth → swap NextAuth provider
- Hosting → self-host atau pindahkan ke platform lain
