# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A social casino platform (no real-money gambling). Monorepo managed with **pnpm workspaces** and **TypeScript** throughout. The platform is in early scaffold stage (Sprint 0); application logic does not yet exist.

**Hard constraints**: No real-money gambling, no payment integration, no illegal gambling logic. All wallet/financial operations must be auditable. Virtual currency limits enforced server-side only — never trust the client for balance or win calculations.

## Workspace Layout

```
apps/
  web/        — @casino/web      — Player-facing Next.js (App Router)
  admin/      — @casino/admin    — Admin panel, Next.js (App Router)
  finance/    — @casino/finance  — Internal finance/reconciliation tool
  support/    — @casino/support  — Support tooling
services/
  api/        — @casino/api      — NestJS backend (global prefix /api/v1)
  realtime/   — @casino/realtime — WebSocket service for live events/leaderboards
packages/
  types/      — @casino/types    — Shared TypeScript type definitions
  ui/         — @casino/ui       — Shared React component library (React peer dep)
  auth/       — @casino/auth     — JWT handling, password hashing, RBAC guards
  config/     — @casino/config   — Shared environment config utilities
```

Packages expose their TypeScript source directly (`main`/`types` point to `src/index.ts` — no build step required for local development).

## Commands

All commands run from the repo root via pnpm.

```bash
pnpm dev          # Start all workspaces in dev mode
pnpm build        # Build all workspaces
pnpm lint         # Lint all workspaces
pnpm typecheck    # Type-check all workspaces
pnpm format       # Check formatting (Prettier)
pnpm format:fix   # Auto-fix formatting
```

To scope a command to one workspace:
```bash
pnpm --filter @casino/api dev
pnpm --filter @casino/types typecheck
```

## TypeScript Configuration

`tsconfig.base.json` at root defines shared strict settings (target ES2020, `moduleResolution: bundler`, strict mode). Every package extends it via `"extends": "../../tsconfig.base.json"` (or the root path for apps).

## Coding Conventions

- **Files**: kebab-case (`user-service.ts`)
- **Directories**: kebab-case (`user-profile/`)
- **Classes / interfaces / types / enums**: PascalCase; interfaces have no `I` prefix
- **Variables / functions**: camelCase
- **React components**: PascalCase file name (`.tsx`)
- **DB tables**: snake_case
- **Env vars**: UPPER_SNAKE_CASE

Prettier is configured at root (`.prettierrc`): single quotes, trailing commas, 100 print width, 2-space indent.

## Testing

- **Unit/integration**: Vitest, `.spec.ts` suffix co-located with source
- **E2E**: Playwright
- Minimum 80% line coverage on unit tests
- Integration tests required for every API endpoint and DB interaction
- E2E tests required for registration, login, gameplay loop, and purchase flow

## Branching & Commits

Branch from `develop` for all feature/fix work. Format: `feature/TICKET-ID-short-slug`.

Commit messages follow Conventional Commits:
```
<type>(<scope>): <description>

Agent: <Role>
Ticket: <ID>
```
Types: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `style`, `perf`.

PRs merge via squash into `develop`. Max 400 lines changed per PR (excluding generated files). `main` is production-protected — only merges from `release/*` branches.

## Agent Workflow Rules

When acting as an AI agent on a ticket:
1. Work on one ticket per branch only.
2. Never push directly to `main` or `develop`.
3. Do not modify files unrelated to the assigned ticket.
4. Include tests with every feature.
5. Write a task summary after completing work.
6. Stop and ask a human when encountering scope ambiguity, new dependencies, or architecture decisions.

## Planned Infrastructure (Sprint 0 targets)

- **Database**: PostgreSQL 16 via Prisma ORM; schema includes `User`, `Wallet`, `LedgerEntry`, `GameSession`, `Leaderboard`
- **Cache**: Redis 7
- **Auth**: JWT with refresh-token rotation
- **API envelope**: `ApiResponse<T>` and `PaginatedResponse<T>` from `@casino/types`
- **Validation**: class-validator or zod on all API input
- **Docker**: `docker-compose.yml` for local Postgres + Redis
