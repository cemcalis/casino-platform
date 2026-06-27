# Sprint 0 — Foundation

**Duration**: 2 weeks (Monday to Monday)  
**Goal**: Establish the project scaffold, tooling, shared packages, and infrastructure so that Sprint 1 agents can write feature code immediately.

---

## Tickets

### S0-001: Initialize Monorepo Scaffold

| Field | Value |
|-------|-------|
| **Role** | Feature Worker |
| **Estimate** | 2 points |
| **Dependencies** | None |
| **Parallel** | No — blocks everything |

**Acceptance Criteria**
- [ ] pnpm workspace at root with `pnpm-workspace.yaml`
- [ ] `apps/web` — Next.js TypeScript app (App Router) for the player frontend
- [ ] `apps/admin` — Next.js TypeScript app (App Router) for the admin panel
- [ ] `services/api` — NestJS TypeScript API project
- [ ] `packages/types` — shared TypeScript type definitions
- [ ] `packages/ui` — shared React component library (shadcn/ui or similar)
- [ ] Root `tsconfig.json` with strict mode, path aliases for all packages
- [ ] `package.json` scripts: `dev`, `build`, `lint`, `typecheck`, `test`
- [ ] `.gitignore` (node_modules, dist, .env, coverage, next, out)
- [ ] `.env.example` with every required variable and a description comment
- [ ] `README.md` with setup instructions

**Out of Scope**
- Application logic, routes, components, API endpoints, database schemas

---

### S0-002: Configure ESLint + Prettier + Pre-commit Hooks

| Field | Value |
|-------|-------|
| **Role** | Feature Worker |
| **Estimate** | 1 point |
| **Dependencies** | S0-001 |
| **Parallel** | With S0-003, S0-004 (after S0-001) |

**Acceptance Criteria**
- [ ] ESLint flat config at root extending `@typescript-eslint`, `react`, `next`, `import`, `prettier`
- [ ] Module boundary rule: no cross-module imports (ESLint `import/no-restricted-paths`)
- [ ] Prettier config at root (single quotes, trailing commas, 100 print width)
- [ ] Husky + lint-staged for pre-commit lint + format
- [ ] All workspace packages pass `npm run lint` with zero errors

---

### S0-003: Docker Compose — PostgreSQL + Redis

| Field | Value |
|-------|-------|
| **Role** | Feature Worker |
| **Estimate** | 1 point |
| **Dependencies** | S0-001 |
| **Parallel** | With S0-002, S0-004 |

**Acceptance Criteria**
- [ ] `docker-compose.yml` with PostgreSQL 16 and Redis 7 services
- [ ] Named volumes for data persistence
- [ ] Health checks on both services
- [ ] `.env.example` with `DATABASE_URL`, `REDIS_URL`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- [ ] `docker-compose.dev.yml` with port mapping and hot-reload-friendly config

---

### S0-004: Shared Types Package

| Field | Value |
|-------|-------|
| **Role** | Feature Worker |
| **Estimate** | 2 points |
| **Dependencies** | S0-001 |
| **Parallel** | With S0-002, S0-003 |

**Acceptance Criteria**
- [ ] `packages/types/tsconfig.json` extends root strict config
- [ ] Base types defined:
  - `User` — id, email, username, createdAt
  - `WalletBalance` — userId, currencyType, amount, version
  - `Transaction` — id, userId, type, amount, referenceId, createdAt
  - `GameSession` — id, userId, gameType, state, bet, result, createdAt
  - `LeaderboardEntry` — userId, username, score, rank
  - `ApiResponse<T>` — `{ data: T, meta: Record<string, unknown>, errors: string[] }`
  - `PaginatedResponse<T>` — extends ApiResponse, adds `{ total, page, pageSize }`
- [ ] Barrel export from `packages/types/src/index.ts`
- [ ] Build script outputs `dist/` with `.d.ts` and `.js`

---

### S0-005: Shared UI Components Package

| Field | Value |
|-------|-------|
| **Role** | Feature Worker |
| **Estimate** | 2 points |
| **Dependencies** | S0-001 |
| **Parallel** | With S0-002, S0-003, S0-004 |

**Acceptance Criteria**
- [ ] `packages/ui/tsconfig.json` extends root strict config
- [ ] Setup shadcn/ui (or equivalent) component library
- [ ] Ship these base components:
  - `Button` — variants (primary, secondary, ghost, danger), loading state
  - `Input` — label, error message, disabled state
  - `Card` — header, body, footer slots
  - `Modal` — overlay, close button, portal
  - `Spinner` — size prop
  - `Badge` — variant prop (info, success, warning, error)
- [ ] Storybook stories for each component (optional — nice to have)
- [ ] Barrel export from `packages/ui/src/index.ts`

---

### S0-006: NestJS API Skeleton

| Field | Value |
|-------|-------|
| **Role** | Feature Worker |
| **Estimate** | 2 points |
| **Dependencies** | S0-001, S0-004 |
| **Parallel** | With S0-002, S0-003, S0-005 |

**Acceptance Criteria**
- [ ] NestJS app boots with `npm run dev` in `services/api`
- [ ] Global prefix `/api/v1`
- [ ] Global exception filter returning `ApiResponse<null>` envelope
- [ ] Global validation pipe (class-validator or zod)
- [ ] Global logging interceptor (method entry, exit, duration)
- [ ] Health endpoint `GET /api/v1/health` returning `{ status: "ok", timestamp }`
- [ ] Prisma ORM installed with `prisma/schema.prisma`
- [ ] Prisma module wired as global provider
- [ ] Configuration module reading from `.env` via `@nestjs/config`
- [ ] `Dockerfile` for the API service (multi-stage, pnpm)

---

### S0-007: CI/CD Pipeline

| Field | Value |
|-------|-------|
| **Role** | Feature Worker |
| **Estimate** | 2 points |
| **Dependencies** | S0-001, S0-006 |
| **Parallel** | No — needs app scaffolding done |

**Acceptance Criteria**
- [ ] GitHub Actions (or equivalent) CI workflow:
  - Trigger: push to `feature/*`, `fix/*`, `develop`, `main`
  - Steps: lint → typecheck → build → test (unit + integration) → test (E2E)
  - Cache pnpm store and node_modules
  - Matrix: Node 20, 22
- [ ] CI computes diff coverage and fails if <80%
- [ ] CI checks PR size and warns if >400 lines
- [ ] CI scans for secrets with truffleHog or similar
- [ ] CD workflow for staging deploy on merge to `develop`
- [ ] CD workflow for production deploy on merge to `main`

---

### S0-008: Database Schema — Initial Migration

| Field | Value |
|-------|-------|
| **Role** | Feature Worker |
| **Estimate** | 2 points |
| **Dependencies** | S0-006 |
| **Parallel** | With S0-007 |

**Acceptance Criteria**
- [ ] Prisma schema with the following models:
  - `User` — id (uuid), email (unique), username (unique), passwordHash, dateOfBirth, ageVerified, role (enum: PLAYER, ADMIN, SUPPORT), createdAt, updatedAt
  - `Wallet` — id (uuid), userId (unique FK), balance (decimal, default 0), version (int, optimistic lock), createdAt, updatedAt
  - `LedgerEntry` — id (uuid), userId (FK), type (enum: ADMIN_GRANT, GAME_BET, GAME_WIN, BONUS), amount (decimal), balanceBefore (decimal), balanceAfter (decimal), referenceId (nullable string), createdAt
  - `GameSession` — id (uuid), userId (FK), gameType (string), betAmount (decimal), winAmount (decimal), result (JSON), status (enum: PENDING, COMPLETED, CANCELLED), clientSeed (string), serverSeed (string, hashed), nonce (int), createdAt, updatedAt
  - `Leaderboard` — id (uuid), gameType (string), period (enum: DAILY, WEEKLY, ALL_TIME), userId (FK), score (decimal), rank (int), createdAt, updatedAt
  - Indexes on: `LedgerEntry.userId`, `LedgerEntry.createdAt`, `GameSession.userId`, `GameSession.gameType`, `Leaderboard.gameType + period`
- [ ] `prisma/seed.ts` — creates admin user (email: admin@local.dev, password hashed)
- [ ] `prisma/migrations/` — initial migration committed
- [ ] Seed script runs with `npm run db:seed`

---

## Sprint 0 Parallelism Map

```
Week 1                   Week 2
│                        │
S0-001 ──► S0-002        │
          S0-003         │
          S0-004         │
          S0-005         │
          S0-006 ──► S0-007
                    S0-008
│                        │
└── Max 4 agents ────────┘
```

- **Wave 1** (Day 1): S0-001 (blocks everything else)
- **Wave 2** (Day 2-3): S0-002, S0-003, S0-004, S0-005, S0-006 (5 agents in parallel)
- **Wave 3** (Day 4-10): S0-007, S0-008 (2 agents in parallel)
- **Buffer** (Day 11-14): Integration testing, fix CI issues, documentation

---

## Definition of Done for Sprint 0
- [ ] All 8 tickets merged to `develop`
- [ ] CI pipeline green on `develop`
- [ ] Developer can run `pnpm dev` and see API health check at `/api/v1/health`
- [ ] Developer can run `pnpm db:seed` and admin user exists
- [ ] All shared packages build successfully
- [ ] Docker compose starts PostgreSQL + Redis + API without errors
