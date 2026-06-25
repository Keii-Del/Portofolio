# Portfolio Serious — 13 Layer Architecture

## Context

User (Pandu, mahasiswa TI UMS) mau upgrade portofolio statis (`index.html` + `script.js`) jadi production-grade full-stack app. Target: **freelancer/client-facing** (lead-gen + showcase jasa). Stack: **Next.js 14 App Router + Postgres + Vercel**, **$0 budget** (free tier semua service), **DB-driven content + admin panel** (CRUD projects, blog, leads).

Outcome: 13 layer infrastructure nyata yang demonstrable ke client/rekrueter — bukan dummy/mockup.

## Stack Decisions (zero-budget friendly)

| Layer | Service | Free tier limit |
|---|---|---|
| Frontend + API (unified) | Next.js 14 App Router | included in Vercel |
| Database + storage | Neon Postgres + Vercel Blob | 0.5 GB / 500 MB |
| Auth | Auth.js (NextAuth v5) + bcrypt + JWT | self-hosted, no cost |
| Hosting + deploy | Vercel Hobby | 100 GB-bandwidth/mo |
| Cloud compute | Vercel Serverless Functions | 100 GB-h/mo |
| CI/CD + VCS | GitHub + GitHub Actions | 2000 min/mo free |
| Role security | RBAC middleware (`admin`/`editor`/`viewer`) | code-level |
| Rate limit | Upstash Redis + `@upstash/ratelimit` | 10k req/day |
| Cache + CDN | Vercel Edge Network + `unstable_cache` | included |
| LB + scaling | Vercel automatic (edge + regional) | included |
| Error tracking | Sentry (`@sentry/nextjs`) | 5k events/mo |
| Log | Axiom + Logtail (or Vercel logs) | 50 MB/mo |
| Bonus: HA + recovery | Neon branching + daily backup + healthcheck route | included |

## Layer-by-Layer Plan

### 1. Frontend
- Convert `index.html` → Next.js `app/page.tsx` (RSC, Tailwind, AOS via framer-motion).
- New routes: `/projects`, `/projects/[slug]`, `/blog`, `/blog/[slug]`, `/contact`, `/admin`.
- UI: Tailwind + shadcn/ui (free, MIT) untuk admin consistency.
- Forms pakai React Hook Form + Zod.

### 2. API + Backend Logic
- Next.js Route Handlers (`app/api/.../route.ts`).
- Business logic di `lib/services/*` (project, blog, lead, auth).
- Validation dengan Zod di boundary (request masuk).
- Server Actions untuk form admin.

### 3. Database + Storage
- Neon Postgres (free: 0.5 GB, auto-suspend).
- Schema (Prisma):
  - `User` (id, email, passwordHash, role)
  - `Project` (id, slug, title, description, tech[], coverUrl, demoUrl, repoUrl, publishedAt, createdAt)
  - `Post` (id, slug, title, content, excerpt, coverUrl, published, publishedAt)
  - `Lead` (id, name, email, message, source, ip, userAgent, createdAt)
  - `Session` (Auth.js)
- Vercel Blob untuk image upload (500 MB free).

### 4. Auth + Authz
- Auth.js v5 (NextAuth) dengan Credentials provider + bcrypt.
- Session: JWT strategy (no DB session table needed).
- Middleware `middleware.ts` protect `/admin/*` dan `/api/admin/*`.
- Password hash 12 rounds.

### 5. Hosting + Deployment
- Vercel (Hobby plan).
- Auto-deploy dari `main` branch.
- Preview deploys per PR.
- Custom domain support (user daftarkan sendiri).

### 6. Cloud Compute
- Vercel Serverless Functions untuk API routes.
- Edge Runtime untuk rate-limit + middleware.
- RSC by default untuk page rendering.

### 7. CI/CD + VCS
- GitHub repo.
- GitHub Actions workflow `.github/workflows/ci.yml`:
  - `pnpm install`
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm prisma migrate deploy` (preview only)
  - `pnpm build` (verify production build)
- Branch protection: PR require checks pass.
- Conventional Commits + commitlint.

### 8. Role-Level Security
- `Role` enum: `ADMIN`, `EDITOR`, `VIEWER`.
- `lib/auth/rbac.ts` — helper `requireRole('ADMIN')` for Server Actions.
- Admin pages check role server-side, redirect non-admin.
- API endpoints verify role before mutation.

### 9. Rate Limiting
- Upstash Redis (free: 10k req/day, 256 MB).
- `@upstash/ratelimit` sliding-window.
- Apply to: `/api/contact` (5/min/IP), `/api/auth/*` (10/min/IP), `/api/admin/*` (60/min/user).
- 429 response dengan `Retry-After`.

### 10. Cache + CDN
- Vercel Edge CDN (static + cached RSC).
- `unstable_cache` for project list, blog list (60s revalidate).
- `revalidateTag()` on admin mutation.
- `Cache-Control: s-maxage=3600, stale-while-revalidate` on public pages.

### 11. Load Balancer + Scaling
- Vercel handles automatically (edge routing + regional serverless).
- Configured via `vercel.json` regions (sin1 for ID, hnd1 for JP backup).

### 12. Error Tracking + Log
- Sentry (`@sentry/nextjs`) — capture server, client, edge errors.
- Source maps uploaded on build.
- Release tagging via Git SHA.
- Log: Vercel runtime logs (free, 1-day retention) + Axiom (50 MB free, 30-day).

### 13. Bonus: Availability + Recovery
- `app/api/health/route.ts` — liveness + DB ping.
- Neon branching: dev/staging DB branches.
- Daily Neon backup (Pro feature, free tier: 7-day PITR via Neon's own PITR).
- Vercel automatic retry on transient function errors.
- UptimeRobot free (50 monitors) untuk `health` endpoint.
- Disaster runbook di `docs/runbook.md`.

## File Structure

```
.
├── app/
│   ├── (public)/
│   │   ├── page.tsx              # Home (portofolio)
│   │   ├── projects/
│   │   ├── blog/
│   │   └── contact/
│   ├── admin/
│   │   ├── layout.tsx            # Admin shell, role check
│   │   ├── page.tsx              # Dashboard
│   │   ├── projects/
│   │   ├── posts/
│   │   └── leads/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── contact/route.ts
│   │   ├── projects/route.ts
│   │   ├── posts/route.ts
│   │   └── health/route.ts
│   └── layout.tsx
├── lib/
│   ├── auth/                     # Auth.js config, rbac
│   ├── db.ts                     # Prisma singleton
│   ├── services/                 # Business logic
│   ├── ratelimit.ts
│   └── sentry.ts
├── components/
│   ├── ui/                       # shadcn primitives
│   └── sections/
├── prisma/
│   └── schema.prisma
├── middleware.ts
├── .github/workflows/ci.yml
├── vercel.json
├── sentry.client.config.ts
├── sentry.server.config.ts
└── docs/runbook.md
```

## Critical Files (to be created)

- `prisma/schema.prisma` — DB schema
- `lib/auth/index.ts` — Auth.js config
- `lib/auth/rbac.ts` — role guards
- `lib/db.ts` — Prisma client
- `lib/ratelimit.ts` — Upstash limiter
- `middleware.ts` — auth + rate-limit gate
- `app/api/health/route.ts` — health check
- `.github/workflows/ci.yml` — CI pipeline
- `vercel.json` — regions config
- `sentry.server.config.ts` + `sentry.client.config.ts`

## Reusable Patterns (from existing code)

Existing `index.html` punya visual reference (Tailwind, AOS, color scheme purple/slate-950). Keep design language, convert ke React Server Components.

`script.js` form validation logic (length + regex) → port ke Zod schema untuk reuse di client + server.

## Implementation Order (incremental)

1. Bootstrap Next.js + Prisma + Auth.js (skeleton)
2. Public pages (home, projects, blog, contact) — DB-driven
3. API routes + Zod validation + rate limit
4. Admin panel + RBAC
5. CI workflow + Sentry + health check
6. Deploy + custom domain + UptimeRobot

## Verification

End-to-end test after each step:
- `pnpm dev` → home loads, projects list from DB
- Submit contact form → lead saved, email validation works
- `curl -X POST /api/contact` 6× → 6th returns 429
- Visit `/admin` unauthenticated → redirect `/login`
- Login as admin → can CRUD project, post
- Sentry test error → appears in Sentry dashboard
- `/api/health` → `{status:"ok", db:"ok"}`
- GitHub Action run on PR → all green
- Vercel preview URL → live
- UptimeRobot monitor → 200 OK

## Out of Scope (v1)

- Email notifications (free tier limits; add Resend later)
- File upload UI (admin can paste URL v1, upload v2)
- i18n (ID only)
- A/B testing
- Analytics (Plausible self-host nanti)
