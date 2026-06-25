# Runbook — Pandu Portfolio

**Last updated:** 2026-06-24
**Stack:** Next.js 14 + Neon Postgres + Vercel + Upstash + Sentry

---

## 1. Health & Monitoring

### Health endpoint

```
GET /api/health
```

Returns:
```json
{
  "status": "ok" | "degraded",
  "checks": {
    "db": { "ok": true, "latencyMs": 12 },
    "app": { "ok": true, "version": "abc1234" }
  },
  "uptimeMs": 18,
  "timestamp": "2026-06-24T..."
}
```

- `200` if all OK
- `503` if DB or app down

### UptimeRobot

- Monitor: `https://<domain>/api/health`
- Interval: 5 min
- Alert: email
- Threshold: 1 failure → alert

### Sentry

- Dashboard: https://sentry.io/organizations/<org>/issues/
- Slack/email alerts on `error` level
- Triage within 24h, fix within 7 days for prod

---

## 2. Common Incidents

### 2.1 Site returns 500

1. Check `/api/health` — DB down?
2. Sentry → top issues → find recent error
3. Vercel → runtime logs (Dashboard → Logs)
4. Recent deploy rolled back? Check `git log --oneline -20` & Vercel deployment list

### 2.2 Database connection error

```
Error: P1001: Can't reach database server
```

1. Neon dashboard → check project status
2. Neon auto-suspends on free tier (after 5 min idle). First request triggers wake (~1-2s).
3. If persistent: check `DATABASE_URL` di Vercel env
4. If Neon itself down: https://neonstatus.com

### 2.3 Rate limit triggered legit user

- Default: 5 req/min untuk `/api/contact`
- User IP di Upstash Redis. Bump limit di `lib/ratelimit.ts`
- Clear individual key: `redis-cli DEL rl:contact:1.2.3.4`

### 2.4 Auth login broken

1. Check `AUTH_SECRET` set di Vercel env
2. User `passwordHash` null? Re-seed admin via `npm run db:seed`
3. Browser cookie cleared → user login ulang

### 2.5 Cache stale

- Admin publish post → `revalidateTag('posts')` di Server Action
- Manual: `curl -X POST https://<domain>/api/revalidate?tag=posts` (kalau endpoint ada)
- Worst case: redeploy via Vercel

---

## 3. Backup & Recovery

### 3.1 Database backup

**Neon free tier includes:**
- 7-day Point-in-Time Recovery (PITR)
- Automatic daily snapshots (Pro only — free tier has PITR only)

**Manual backup (anytime):**
```bash
# Dump schema + data
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup-20260624.sql
```

### 3.2 Restore from PITR (Neon dashboard)

1. https://console.neon.tech → project → Restore
2. Pilih timestamp
3. Restore creates new branch → swap connection string → verify → cutover

### 3.3 Redeploy from scratch

1. Vercel → Project → Deployments → pick previous successful → Promote to Production
2. Or: `git revert <bad-sha> && git push`

### 3.4 Disaster — total loss

1. Provision new Neon project
2. Run latest backup: `psql $NEW_DATABASE_URL < backup-latest.sql`
3. Update `DATABASE_URL` di Vercel env
4. Re-deploy
5. Verify `/api/health` → 200
6. Check Sentry — errors should clear in ~5 min

---

## 4. Scaling

### 4.1 When to scale

Free tier limits:
- Vercel: 100 GB bandwidth/mo, 100 GB-hours serverless/mo
- Neon: 0.5 GB storage, 191.9 compute hours/mo
- Upstash: 10k commands/day

Watch Vercel → Usage tab. Hit 80% → upgrade or optimize.

### 4.2 Optimize before upgrading

- Cache lebih agresif (bump `revalidate`)
- Reduce image sizes (next/image + Vercel Image Optimization)
- Static generation untuk page yang jarang berubah
- Lazy load heavy components

### 4.3 Upgrade path

| Resource | Free → Paid | Cost |
|---|---|---|
| Vercel | Hobby → Pro | $20/mo |
| Neon | Free → Launch | $19/mo |
| Upstash | Free → Pay-as-you-go | minimal |
| Sentry | Free → Team | $26/mo |

Total: ~$65/mo untuk production-ready.

---

## 5. Security

### 5.1 Credentials

- `AUTH_SECRET` di Vercel env (never commit)
- Admin password: min 16 chars, alphanumeric + symbols
- Rotate `AUTH_SECRET` yearly: generate new → redeploy → invalidate all sessions
- Database URL contains password — keep in env only

### 5.2 Rate limit abuse

- Check Upstash dashboard → analytics
- High traffic from single IP → block via Vercel Firewall (paid) or Vercel WAF rules
- Report abuse: `support@upstash.com` + relevant logs

### 5.3 Vulnerability

1. Sentry alert atau manual pen-test
2. Check `npm audit`
3. Update deps: `npm update`
4. Test in preview deploy
5. Roll to prod

---

## 6. On-call

**Solo maintainer:** Pandu

- Working hours: 09:00-22:00 WIB
- Response time: 1h working hours, 12h off-hours
- Escalation: none (single point of contact)

For client-facing incidents (site down, lead form broken):
1. Sentry + UptimeRobot email
2. Triage in <1h
3. Fix or rollback in <4h

---

## 7. Useful links

- Neon console: https://console.neon.tech
- Vercel dashboard: https://vercel.com/dashboard
- Upstash console: https://console.upstash.com
- Sentry: https://sentry.io
- GitHub repo: <fill in>
- UptimeRobot: https://uptimerobot.com/dashboard
