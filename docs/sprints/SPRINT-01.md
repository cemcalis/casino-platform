# Sprint 01 — App & Infrastructure Scaffold

**Goal**: Get every app and service to a runnable skeleton so feature work can begin in Sprint 02.

## Tickets

| ID | Title | Estimate | Status |
|----|-------|----------|--------|
| SPR-002 | Next.js apps scaffold | 2 pts | 🔲 Todo |
| SPR-003 | NestJS API scaffold | 2 pts | 🔲 Todo |
| SPR-004 | Docker — PostgreSQL + Redis | 1 pt | 🔲 Todo |
| SPR-005 | GitHub Actions CI | 2 pts | 🔲 Todo |

## Ticket Details

### SPR-002 — Next.js Apps Scaffold
Replace echo stubs in `apps/web` and `apps/admin` with real Next.js 14 (App Router) projects.
- `apps/web` — player-facing, public routes
- `apps/admin` — internal, protected routes
- Both extend `@casino/ui` and share `tsconfig.base.json`
- `pnpm dev` starts both on different ports (3000, 3001)
- No pages or components beyond the root layout

### SPR-003 — NestJS API Scaffold
Bootstrap `services/api` as a working NestJS application.
- Global prefix `/api/v1`
- Global exception filter → `ApiResponse<null>` envelope
- Global validation pipe (class-validator)
- Global logging interceptor
- `GET /api/v1/health` → `{ status: "ok", timestamp }`
- `@nestjs/config` wired to `.env`
- No feature modules yet

### SPR-004 — Docker — PostgreSQL + Redis
Extend the existing `docker-compose.yml` with health checks and a dev override file.
- PostgreSQL 16 with named volume and health check
- Redis 7 with health check
- `docker-compose.dev.yml` with port mappings
- `.env.example` updated with `DATABASE_URL`, `REDIS_URL`

### SPR-005 — GitHub Actions CI
Create `.github/workflows/ci.yml`.
- Trigger: push to `feature/*`, `fix/*`, `develop`, `main`
- Steps: install → lint → typecheck → build → test
- pnpm store cached between runs
- Matrix: Node 20, 22

## Definition of Done

- [ ] `pnpm dev` starts web (port 3000), admin (port 3001), and API (port 4000)
- [ ] `GET /api/v1/health` returns 200
- [ ] `docker compose up` starts Postgres and Redis with passing health checks
- [ ] CI is green on a test PR
