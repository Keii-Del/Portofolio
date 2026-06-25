# Pandu Portfolio

Production-grade portfolio dengan **13-layer architecture**. Next.js 14, Postgres, Vercel.

## Stack

| Layer | Service |
|---|---|
| Frontend | Next.js 14 App Router, RSC, Tailwind, framer-motion |
| API + Backend | Route Handlers + Server Actions, Zod validation |
| Database | Neon Postgres + Prisma ORM |
| Auth | Auth.js v5 (Credentials + bcrypt + JWT) |
| Storage | Vercel Blob (image upload) |
| Hosting | Vercel Hobby (Edge + Serverless) |
| CI/CD | GitHub Actions |
| Rate Limit | Upstash Redis (sliding window) |
| Cache | `unstable_cache` + Vercel Edge CDN |
| LB / Scaling | Vercel (sin1 + hnd1 regions) |
| Error Tracking | Sentry |
| Log | Vercel runtime logs + Sentry breadcrumbs |
| HA / Recovery | Neon PITR + UptimeRobot health monitor |

## Setup

### 1. Install deps

```bash
npm install
```

### 2. Provision external services (free tier)

- **Neon Postgres** — https://console.neon.tech → create project → copy connection string
- **Upstash Redis** — https://console.upstash.com → create database → copy REST URL + token
- **Vercel Blob** — auto-provisioned by Vercel when you deploy
- **Sentry** — https://sentry.io → create project → copy DSN

### 3. Set env vars

Copy `.env.example` ke `.env.local`:

```bash
cp .env.example .env.local
```

Isi semua value. Untuk `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 4. Setup database

```bash
npx prisma migrate dev --name init
npm run db:seed
```

Seed bikin admin user dari `ADMIN_EMAIL` + `ADMIN_PASSWORD` + 1 sample project.

### 5. Run dev

```bash
npm run dev
```

Buka http://localhost:3000

## Routes

### Public
- `/` — Home
- `/projects` — Project list
- `/projects/[slug]` — Project detail
- `/blog` — Blog list
- `/blog/[slug]` — Blog post
- `/#contact` — Contact form (client island)

### Admin (auth required)
- `/admin/login` — Login
- `/admin` — Dashboard
- `/admin/projects` — CRUD projects
- `/admin/posts` — CRUD posts
- `/admin/leads` — View contact form submissions

### API
- `GET/POST /api/projects` — public list / admin create
- `PATCH/DELETE /api/projects/[id]` — admin
- `GET/POST /api/posts` — public list / admin create
- `PATCH/DELETE /api/posts/[id]` — admin
- `GET/PATCH /api/leads` — admin
- `POST /api/contact` — public (rate-limited 5/min)
- `GET /api/health` — health check (DB ping)
- `/api/auth/*` — Auth.js

## Deployment

### Vercel

1. Push ke GitHub
2. Import di https://vercel.com/new
3. Set env vars di Vercel dashboard (sama dengan `.env.local`)
4. Deploy

Auto-deploy dari `main` branch. PR = preview URL.

### Custom domain

Settings → Domains di Vercel. Ikut instruksi DNS.

### UptimeRobot

1. Daftar https://uptimerobot.com (free)
2. Add monitor: HTTP(s) → `https://your-domain.com/api/health`
3. Interval 5 min. Alert via email.

## Scripts

```bash
npm run dev          # Dev server
npm run build        # Production build
npm run start        # Run production build
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run db:generate  # Prisma client
npm run db:migrate   # Create + apply migration
npm run db:deploy    # Apply migrations (CI/prod)
npm run db:studio    # Prisma Studio GUI
npm run db:seed      # Seed admin user
```

## Architecture Notes

- **Server-first**: Default to RSC. Client components only for interactivity (form, nav, admin).
- **Validation**: Zod schemas di boundary (API request, form submit). Reuse untuk client + server.
- **Cache**: `unstable_cache` tagged per resource. Invalidate via `revalidateTag()` di Server Action.
- **Rate limit**: Edge middleware. Defense-in-depth check di route handler.
- **Auth**: JWT session. `requireRole()` di Server Action / page. `checkRole()` di API.
- **Errors**: Sentry capture di setiap catch + global `app/error.tsx`. Health endpoint untuk monitor.

## Disaster Recovery

Lihat `docs/runbook.md`.
