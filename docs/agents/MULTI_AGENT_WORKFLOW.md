# Multi-Agent Workflow

Guide for running multiple Claude Code agents in parallel on this monorepo.

---

## Agent Roles

| Role | Scope | Typical Tickets |
|------|-------|-----------------|
| **Orchestrator** | Coordinates other agents, owns the sprint board, resolves blockers | — |
| **Backend Agent** | `services/api`, `services/realtime`, `packages/auth`, `packages/config` | NestJS endpoints, Prisma schema, business logic |
| **Frontend Agent** | `apps/web`, `apps/admin`, `apps/finance`, `apps/support`, `packages/ui` | Next.js pages, React components, routing |
| **DevOps Agent** | `docker-compose.yml`, `.github/`, `turbo.json`, `package.json` (root) | CI pipelines, infra config, dependency upgrades |
| **QA Agent** | `*.spec.ts`, `e2e/`, test fixtures | Unit, integration, and Playwright E2E tests |
| **Security Reviewer** | Read-only across all packages | Auth flows, RBAC, input validation, secret handling |
| **Code Reviewer** | Read-only across changed files | Style, conventions, logic correctness before merge |

Each agent works on **exactly one ticket** in **exactly one branch**. Agents never share a branch.

---

## Branch Rules

```
one agent → one ticket → one branch
```

- Branch from `develop`: `git checkout -b feature/TICKET-ID-short-slug develop`
- Never commit directly to `main` or `develop`.
- Branch name must match the ticket ID (e.g. `feature/SPR-006-prisma-schema`).
- When the ticket is done, open a PR to `develop` and stop — do not self-merge.

---

## Worktree Strategy

Git worktrees let multiple agents work on the same repo simultaneously without interfering with each other's working directories.

### Create a worktree per agent

```bash
# From the repo root — one command per parallel agent
git worktree add ../casino-platform-spr006 -b feature/SPR-006-prisma-schema develop
git worktree add ../casino-platform-spr007 -b feature/SPR-007-jwt-auth develop
```

Each worktree gets its own directory with a clean checkout. Agents write only inside their own worktree directory.

### Run an agent in its worktree

Open a Claude Code session pointed at the worktree directory:

```bash
claude --cwd ../casino-platform-spr006
```

Pass the ticket instructions as the first prompt so the agent never needs to ask what to do.

### Clean up after merge

```bash
git worktree remove ../casino-platform-spr006
git branch -d feature/SPR-006-prisma-schema
```

### Rules

- Never run `pnpm install` from two worktrees at the same time — pnpm's store lock will conflict. Stagger installs or use `--frozen-lockfile` (no network writes).
- Each worktree shares the git object store; large file writes are safe.
- Do not cross-edit between worktrees. If Agent A needs Agent B's output, merge B to `develop` first, then rebase A.

---

## PR Automation

GitHub CLI is installed at:

```
C:\Program Files\GitHub CLI\gh.exe
```

Use the full path if `gh` is not on `PATH`:

```powershell
& "C:\Program Files\GitHub CLI\gh.exe" pr create `
  --title "feat(api): add Prisma schema" `
  --body "Implements SPR-006. Adds User, Wallet, LedgerEntry models." `
  --base develop `
  --head feature/SPR-006-prisma-schema
```

### PR checklist before opening

- [ ] All root commands pass locally: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`
- [ ] Diff is under 400 lines (excluding generated files such as `pnpm-lock.yaml`, `*.d.ts`)
- [ ] Commit message follows Conventional Commits with `Agent:` and `Ticket:` trailers
- [ ] No secrets, no `.env` files committed

### PR description template

```
## Summary
- <bullet 1>
- <bullet 2>

## Ticket
SPR-XXX

## Test plan
- [ ] Unit tests added / updated
- [ ] Integration test for each new endpoint
- [ ] `pnpm typecheck` passes
- [ ] CI green

Agent: <Role>
```

---

## CI Rule

**Never merge a PR unless the GitHub Actions CI workflow passes.**

The CI job (`.github/workflows/ci.yml`) runs:

1. `pnpm lint`
2. `pnpm typecheck`
3. `pnpm test`
4. `pnpm build`

If any step fails, fix the branch and push again. Do not bypass with `--no-verify` or skip checks.

To watch CI status from the CLI:

```powershell
& "C:\Program Files\GitHub CLI\gh.exe" pr checks <PR-number> --watch
```

---

## Token / Context Optimization

Agents operate most efficiently when they read only what they need.

### Rules

1. **Read only affected files.** Before reading anything, identify the ticket scope. A backend ticket touches `services/api/src/**` — do not scan `apps/` or `packages/ui/`.
2. **Do not rescan the whole repo.** Use `Glob` with a narrow pattern or `Grep` with a targeted expression. Never run open-ended searches across all files when the file path is already known.
3. **Use concise summaries for handoffs.** When passing context between agents (e.g. Orchestrator → Backend Agent), write a 3–5 bullet summary of what was decided, not the full conversation. Put it in the PR description or a short brief file.
4. **Stop reading when you have enough.** If the first file read answers the question, do not read five more files "to be sure."
5. **Prefer targeted commands.** `pnpm --filter @casino/api typecheck` is faster and cheaper than `pnpm typecheck` when only the API changed.
6. **Do not re-derive established facts.** If the CLAUDE.md or a prior agent summary already states a convention, trust it — do not re-read the source files to confirm.

---

## Current Project State

### Completed — Sprint 1

| Ticket | Description | Branch | Status |
|--------|-------------|--------|--------|
| SPR-001 | Turborepo monorepo foundation | `feature/spr-001-monorepo-scaffold` | merged |
| SPR-002 | Next.js app scaffolds (web, admin, finance, support) | merged into above | merged |
| SPR-003 | NestJS API scaffold with `/api/v1/health` | merged | merged |
| SPR-004 | Docker Compose — PostgreSQL 16 + Redis 7 | merged | merged |
| SPR-005 | GitHub Actions CI pipeline | `feature/spr-005-github-actions-ci` | PR #5 open |

### Up Next — Sprint 2

| Ticket | Description | Suggested Agent | Depends on |
|--------|-------------|-----------------|------------|
| SPR-006 | Prisma schema (`User`, `Wallet`, `LedgerEntry`, `GameSession`, `Leaderboard`) | Backend Agent | SPR-004 |
| SPR-007 | JWT auth — registration, login, refresh-token rotation | Backend Agent | SPR-006 |
| SPR-008 | RBAC guards and `@casino/auth` package | Security Reviewer + Backend Agent | SPR-007 |
| SPR-009 | `ApiResponse<T>` / `PaginatedResponse<T>` types in `@casino/types` | Backend Agent | SPR-001 |
| SPR-010 | Shared UI component library stub (`@casino/ui`) | Frontend Agent | SPR-001 |

### Architecture constraints for upcoming tickets

- All balance/win calculations must happen server-side only — never trust client input.
- Every wallet mutation requires a corresponding `LedgerEntry` (immutable audit trail).
- JWT secret must come from environment variables; never hardcode.
- Prisma migrations go in `services/api/prisma/migrations/` — do not hand-edit migration SQL.
