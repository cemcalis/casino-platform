# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

A social casino platform (no real-money gambling). Monorepo managed with **pnpm workspaces** and **TypeScript** throughout.

**Hard constraints** — non-negotiable, enforced in every ticket:
- No real-money gambling, no payment integration, no illegal gambling logic
- All wallet/financial operations must be auditable
- Virtual currency limits enforced server-side only — never trust the client for balance or win calculations
- No secrets or credentials committed to any file

---

## Master Command

When the user says **"Build the complete casino platform"** or any request that spans multiple tickets, agents, or sprints:

1. **Do not implement code directly.**
2. Invoke the Orchestrator skill: `.claude/skills/orchestrator/SKILL.md`
3. Decompose into epics → stories → tasks → agent assignments → worktree plan → risk list → exact commands.
4. Present the plan and wait for human approval before any agent starts work.

---

## Current Project State

### Sprint 1 — Complete

| Ticket | Description | Status |
|--------|-------------|--------|
| SPR-001 | Turborepo monorepo foundation | ✓ merged |
| SPR-002 | Next.js app scaffolds (web, admin, finance, support) | ✓ merged |
| SPR-003 | NestJS API scaffold with `/api/v1/health` | ✓ merged |
| SPR-004 | Docker Compose — PostgreSQL 16 + Redis 7 | ✓ merged |
| SPR-005 | GitHub Actions CI pipeline | ✓ merged |

### Agent Infrastructure — Complete

| Artifact | Location | Status |
|----------|----------|--------|
| Multi-agent workflow guide | `docs/agents/MULTI_AGENT_WORKFLOW.md` | ✓ done |
| Worktree Manager + scripts | `docs/agents/WORKTREE_MANAGER.md`, `scripts/` | ✓ done |
| Orchestrator Skill | `.claude/skills/orchestrator/SKILL.md` | ✓ done |
| Auto PR Merge Skill | `.claude/skills/auto-pr-merge/SKILL.md` | ✓ done |
| Agent role prompts (7 roles) | `.claude/agents/` | ✓ done |

### Sprint 2 — Up Next

| Ticket | Description | Agent | Depends on |
|--------|-------------|-------|------------|
| SPR-006 | Prisma schema (`User`, `Wallet`, `LedgerEntry`, `GameSession`, `Leaderboard`) | Backend | SPR-004 |
| SPR-007 | JWT auth + refresh-token rotation | Backend | SPR-006 |
| SPR-008 | RBAC guards + `@casino/auth` package | Backend | SPR-007 |
| SPR-009 | `ApiResponse<T>` / `PaginatedResponse<T>` in `@casino/types` | Backend | SPR-001 |
| SPR-010 | `@casino/ui` shared component stubs | Frontend | SPR-001 |

SPR-006 and SPR-010 can run in parallel. SPR-007 must wait for SPR-006.

---

## Agent System

Agent role prompts live in `.claude/agents/`. Load the relevant file at the start of each agent session.

| File | Role |
|------|------|
| `orchestrator.md` | Plans, decomposes, routes — never writes app code |
| `backend-agent.md` | `services/`, `packages/auth|config|types` |
| `frontend-agent.md` | `apps/`, `packages/ui` |
| `devops-agent.md` | Docker, CI, Turborepo, root config |
| `qa-agent.md` | `*.spec.ts`, `e2e/` — test files only |
| `security-reviewer.md` | Read-only security audit |
| `code-reviewer.md` | Read-only style and logic review |

**One agent = one ticket = one branch = one worktree.** Agents never share a working directory or branch.

### Worktree setup

```powershell
# Create all agent worktrees (run once from repo root)
.\scripts\create-worktrees.ps1

# Open an agent session in its worktree
claude --cwd ..\casino-platform-backend

# Remove worktrees after sprint (skips any with uncommitted changes)
.\scripts\remove-worktrees.ps1
```

Worktree directories are siblings of the repo root:

```
casino-platform-orchestrator/   feature/orchestrator
casino-platform-backend/        feature/backend-agent
casino-platform-frontend/       feature/frontend-agent
casino-platform-devops/         feature/devops-agent
casino-platform-qa/             feature/qa-agent
casino-platform-security/       feature/security-agent
casino-platform-reviewer/       feature/reviewer-agent
```

---

## Delivery System

After a ticket is complete, follow the Auto PR Merge Skill (`.claude/skills/auto-pr-merge/SKILL.md`). Summary:

1. Run local checks for the affected workspace only:
   ```powershell
   pnpm --filter @casino/<workspace> lint
   pnpm --filter @casino/<workspace> typecheck
   pnpm --filter @casino/<workspace> test
   pnpm --filter @casino/<workspace> build
   ```
2. Stage **only** the files the ticket touches — never `git add .` or `git add -A`.
3. Commit with Conventional Commits format including `Agent:` and `Ticket:` trailers.
4. Push the branch: `git push -u origin <branch>`.
5. Create PR using GitHub CLI:
   ```powershell
   & "C:\Program Files\GitHub CLI\gh.exe" pr create --title "..." --body "..." --base develop --head <branch>
   ```
6. Watch CI: `& "C:\Program Files\GitHub CLI\gh.exe" pr checks <PR> --watch`
7. **Never merge with failing or pending checks.**
8. **Ask the human before merging.** Auto-merge is disabled by default.

---

## Workspace Layout

```
apps/
  web/        — @casino/web      — Player-facing Next.js (App Router)  [port 3000]
  admin/      — @casino/admin    — Admin panel, Next.js (App Router)   [port 3001]
  finance/    — @casino/finance  — Internal finance/reconciliation      [port 3002]
  support/    — @casino/support  — Support tooling                      [port 3003]
services/
  api/        — @casino/api      — NestJS backend (global prefix /api/v1) [port 4000]
  realtime/   — @casino/realtime — WebSocket service for live events/leaderboards
packages/
  types/      — @casino/types    — Shared TypeScript type definitions
  ui/         — @casino/ui       — Shared React component library (React peer dep)
  auth/       — @casino/auth     — JWT handling, password hashing, RBAC guards
  config/     — @casino/config   — Shared environment config utilities
.claude/
  agents/     — Agent role prompts (one file per role)
  skills/     — Reusable skill definitions (orchestrator, auto-pr-merge)
docs/
  agents/     — MULTI_AGENT_WORKFLOW.md, WORKTREE_MANAGER.md
  epics/      — EPIC-01 through EPIC-05
  sprints/    — SPRINT-01.md (and future sprint docs)
scripts/
  create-worktrees.ps1
  remove-worktrees.ps1
```

Packages expose TypeScript source directly (`main`/`types` → `src/index.ts` — no build step for local dev).

---

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

Scope to one workspace:
```bash
pnpm --filter @casino/api dev
pnpm --filter @casino/types typecheck
```

---

## TypeScript Configuration

`tsconfig.base.json` at root defines shared strict settings (target ES2020, `moduleResolution: bundler`, strict mode). Every package extends it via `"extends": "../../tsconfig.base.json"`.

NestJS override (`services/api/tsconfig.json`): `module: commonjs`, `moduleResolution: node`, `experimentalDecorators: true`, `emitDecoratorMetadata: true`. This is required for NestJS dependency injection and must not be removed.

---

## Coding Conventions

- **Files**: kebab-case (`user-service.ts`)
- **Directories**: kebab-case (`user-profile/`)
- **Classes / interfaces / types / enums**: PascalCase; interfaces have no `I` prefix
- **Variables / functions**: camelCase
- **React components**: PascalCase file name (`.tsx`)
- **DB tables**: snake_case
- **Env vars**: UPPER_SNAKE_CASE

Prettier (`.prettierrc`): single quotes, trailing commas, 100-char print width, 2-space indent.

Comments: explain WHY, not WHAT. No multi-paragraph docstrings. No ticket/PR references in source comments.

---

## Testing

- **Unit/integration**: Vitest, `.spec.ts` suffix co-located with source
- **E2E**: Playwright (`e2e/`)
- Minimum 80% line coverage on unit tests
- Integration tests required for every API endpoint and DB interaction — no mocked database
- E2E tests required for: registration, login, gameplay loop, purchase flow

---

## Branching & Commits

Branch from `develop`. Format: `feature/TICKET-ID-short-slug`.

```
<type>(<scope>): <description>

Agent: <Role>
Ticket: <ID>
```

Types: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `style`, `perf`.

PRs squash-merge into `develop`. Max 400 lines changed per PR (excluding generated files: `pnpm-lock.yaml`, `*.d.ts`, migration SQL). `main` is production-protected — only `release/*` branches merge to `main`.

---

## Token Optimization

- Read `CLAUDE.md` and the relevant sprint/epic doc first — these contain most needed context.
- Read only files inside the ticket's scope. Do not scan `apps/`, `services/`, or `packages/` unless the task requires it.
- Use `Glob` or `Grep` with narrow patterns if a file path is unknown.
- Use `pnpm --filter` to scope commands to the affected workspace.
- Stop reading when the task is clear.
- Summarize handoffs in 3–5 bullets — not full conversation history.

---

## Safety Constraints

These apply to every agent, every ticket, without exception:

| Constraint | Rule |
|-----------|------|
| No real-money gambling | Any ticket touching payment, real-currency, or gambling payout logic is an automatic blocker — escalate to human |
| No payment integration | No payment gateway SDKs, no financial API keys, no transaction processing |
| No secrets committed | All credentials via environment variables; `.env` is gitignored |
| No CI bypass | Never use `--no-verify`, never disable workflow steps, never force-push to protected branches |
| No unrelated edits | Agents edit only files within their ticket scope |
| No client-trusted values | Balance, wins, and scores are calculated server-side only |
| No direct merges to main/develop | All changes go through PR + CI |
