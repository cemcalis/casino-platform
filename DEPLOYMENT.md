# Deployment Guide

## apps/web — Vercel

### Prerequisites
- Vercel account connected to this repository
- Backend API deployed and accessible (see `services/api` section below)

### Vercel Project Setup

1. Import the repository in Vercel.
2. Set **Root Directory** to `apps/web`.
3. Set **Framework Preset** to `Next.js`.
4. Set **Build Command** to `cd ../.. && pnpm --filter @casino/web build`.
5. Set **Install Command** to `cd ../.. && pnpm install --frozen-lockfile`.

### Environment Variables (apps/web)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Full base URL of the deployed API, e.g. `https://api.your-domain.com/api/v1` |
| `NEXT_PUBLIC_DEMO_MODE` | No | Set to `true` to show a demo banner and disable live auth. Useful for staging previews without a live API. |

> Never commit actual values. Set variables in the Vercel dashboard under **Settings → Environment Variables**.

### Demo / Preview Deploys

Set `NEXT_PUBLIC_DEMO_MODE=true` on preview branches when no live API is connected. The app will render a banner and handle API errors gracefully.

---

## services/api — Backend Deploy

The NestJS API can be deployed to any Node.js host (Railway, Render, Fly.io, etc.).

### Environment Variables (services/api)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `JWT_SECRET` | Yes | Secret for signing JWT access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | Yes | Secret for signing refresh tokens (min 32 chars) |
| `JWT_EXPIRES_IN` | No | Access token TTL (default: `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | No | Refresh token TTL (default: `7d`) |
| `NODE_ENV` | Yes | Set to `production` |
| `PORT` | No | HTTP port (default: `4000`) |

### Database

Run Prisma migrations on first deploy:

```bash
pnpm --filter @casino/api exec prisma migrate deploy
```

---

## apps/admin — Vercel

Same Vercel setup as `apps/web` with **Root Directory** `apps/admin`.

### Environment Variables (apps/admin)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Same API base URL as above |

---

## CI / CD Notes

- All PRs run lint, typecheck, and build via GitHub Actions before merge.
- `main` is production-protected; only `release/*` branches merge to it.
- Never force-push to `main` or bypass CI.
