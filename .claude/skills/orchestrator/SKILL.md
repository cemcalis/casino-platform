# Orchestrator Skill

## Purpose

Convert a high-level request into a safe, decomposed, multi-agent execution plan. This skill never writes application code — it only plans, routes, and coordinates.

Outputs:
- Epics → Stories → Tasks breakdown
- Ticket list with scope, dependencies, and acceptance criteria
- Agent assignment table
- Branch and worktree plan
- Risk list
- Exact next commands to run

---

## When to Use

Invoke this skill when:

- The user says something like "Build the complete casino platform" or "Implement Sprint 2"
- A sprint needs to be decomposed into parallel-safe tickets
- Multiple agents or worktrees are required to execute work simultaneously
- The scope is too large for a single agent context window

Do **not** invoke this skill for single-ticket, single-agent work — hand that directly to the relevant agent.

---

## Inputs Required

Before producing a plan, collect or confirm:

| Input | Source |
|-------|--------|
| **Project goal** | User message |
| **Current sprint** | `docs/sprints/SPRINT-XX.md` |
| **Completed tickets** | Git log or sprint doc |
| **Repo state** | `git status`, open PRs |
| **Constraints** | `CLAUDE.md` hard constraints section |
| **Available agents** | `docs/agents/MULTI_AGENT_WORKFLOW.md` |

Read `CLAUDE.md` and the relevant sprint/epic docs first. Do not scan the full repo unless the user explicitly requests it.

---

## Output Format

Produce the plan in this exact structure. Keep each section tight.

### 1. Execution Plan (≤ 10 lines)

Narrative summary: what will be built, in what order, and why that order.

### 2. Ticket List

```
| ID      | Title                  | Scope                         | Depends on | Est. size |
|---------|------------------------|-------------------------------|------------|-----------|
| SPR-006 | Prisma schema          | services/api/prisma/           | SPR-004    | S         |
| SPR-007 | JWT auth               | services/api/src/auth/         | SPR-006    | M         |
```

Size: S = < 100 LOC, M = 100–300 LOC, L = 300–400 LOC (hard limit per PR).

### 3. Agent Assignment Table

```
| Ticket  | Agent            | Worktree                        | Branch                  |
|---------|------------------|---------------------------------|-------------------------|
| SPR-006 | Backend Agent    | ../casino-platform-backend      | feature/SPR-006-prisma  |
| SPR-010 | Frontend Agent   | ../casino-platform-frontend     | feature/SPR-010-ui-stub |
```

### 4. Parallelism Plan

List which tickets can run simultaneously (non-overlapping file scopes) and which must be sequenced (shared files or dependency chain).

```
Parallel group A: SPR-006, SPR-010
Sequential after A: SPR-007 (needs SPR-006 User model)
Sequential after SPR-007: SPR-008
```

### 5. Risk List

Flag anything that could break the plan:

- File scope overlaps between parallel tickets
- Missing upstream merges a ticket depends on
- Tickets that touch `main`/`develop` branch rules
- Any ticket that could introduce real-money or payment logic (automatic blocker)

### 6. Next Exact Commands

Paste-ready commands the user runs to start execution:

```powershell
# 1. Ensure worktrees exist
.\scripts\create-worktrees.ps1

# 2. Open agents (separate terminals)
claude --cwd ..\casino-platform-backend
claude --cwd ..\casino-platform-frontend

# 3. First prompt for Backend Agent
"Implement ONLY Ticket SPR-006: Prisma schema. Goal: ..."
```

---

## Hard Rules

These rules are non-negotiable. The Orchestrator must enforce them in every plan it produces.

| Rule | Detail |
|------|--------|
| Never implement code directly | The Orchestrator plans and routes only. Code is written by specialist agents. |
| Never bypass CI | All merges require a passing GitHub Actions run. No `--no-verify`, no skip flags. |
| Never merge without green checks | Use `gh pr checks <PR> --watch` before approving. |
| Never create real-money or payment logic | Hard constraint from `CLAUDE.md`. Any ticket touching payments is an automatic blocker — escalate to human. |
| One ticket per branch | Each agent works on exactly one ticket. Branch name must include the ticket ID. |
| One agent per worktree | No two agents share a working directory. |
| Read only affected files | Agents read only the files their ticket touches. |
| PRs target `develop`, not `main` | `main` is production-protected. Only `release/*` branches merge to `main`. |
| Max 400 LOC per PR | Excluding generated files (`pnpm-lock.yaml`, `*.d.ts`, migration SQL). Split if over limit. |

---

## Agent Routing

Assign tickets to agents by file scope:

| Agent | File scope | Notes |
|-------|-----------|-------|
| **Backend Agent** | `services/`, `packages/auth/`, `packages/config/` | NestJS, Prisma, business logic |
| **Frontend Agent** | `apps/`, `packages/ui/` | Next.js, React components |
| **DevOps Agent** | `docker-compose.yml`, `.github/`, `turbo.json`, root `package.json` | CI, infra, deps |
| **QA Agent** | `*.spec.ts`, `e2e/` | Unit, integration, Playwright |
| **Security Reviewer** | Read-only, all packages | Auth flows, RBAC, secret handling |
| **Code Reviewer** | Read-only, changed files only | Style, conventions, logic — runs after agent, before merge |

If a ticket touches files from two different agent scopes, split it into two tickets first.

---

## Token Optimization Rules

The Orchestrator must stay lean so downstream agents have full context budgets.

1. Read `CLAUDE.md` and the relevant sprint/epic docs first — these contain most needed context.
2. Do not read the full repo. Use `Glob` or `Grep` with narrow patterns if a file path is unknown.
3. Summarize the plan in under 20 lines unless the user explicitly asks for more detail.
4. When handing off to an agent, write a 3–5 bullet brief — not the full conversation history.
5. Do not re-derive facts already stated in `CLAUDE.md` or prior sprint docs.
6. Stop reading when you have enough to produce the plan.

---

## Current Project State (as of Sprint 1 complete)

Read `docs/sprints/SPRINT-01.md` and `docs/agents/MULTI_AGENT_WORKFLOW.md` for current state. Quick reference:

- **Completed**: SPR-001 (monorepo), SPR-002 (Next.js apps), SPR-003 (NestJS API), SPR-004 (Docker), SPR-005 (CI)
- **Up next**: SPR-006 (Prisma schema), SPR-007 (JWT auth), SPR-008 (RBAC), SPR-009 (API types), SPR-010 (UI stubs)
- **Blocked until human approves**: any ticket involving wallet mutations, real-money logic, or payment providers
