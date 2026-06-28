# Worktree Manager

How to run multiple Claude Code agents in parallel on this monorepo using git worktrees.

---

## Why worktrees?

A single git checkout allows only one working directory. When two agents edit files in the same directory at the same time they conflict — one overwrites the other's changes.

Git worktrees solve this by creating additional checkouts of the same repository, each in its own directory on disk. They share the git object store (so no data is duplicated) but each has an independent working tree and a dedicated branch. Agents never touch each other's files.

---

## Directory layout after setup

```
Desktop/
├── casino-platform/              ← main repo (your current session)
├── casino-platform-orchestrator/ ← Orchestrator agent
├── casino-platform-backend/      ← Backend agent
├── casino-platform-frontend/     ← Frontend agent
├── casino-platform-devops/       ← DevOps agent
├── casino-platform-qa/           ← QA agent
├── casino-platform-security/     ← Security Reviewer agent
└── casino-platform-reviewer/     ← Code Reviewer agent
```

---

## Creating the worktrees

Run once from the repo root:

```powershell
.\scripts\create-worktrees.ps1
```

This creates seven sibling directories, each on its own branch branched from `develop`.

| Directory | Branch |
|-----------|--------|
| `casino-platform-orchestrator` | `feature/orchestrator` |
| `casino-platform-backend` | `feature/backend-agent` |
| `casino-platform-frontend` | `feature/frontend-agent` |
| `casino-platform-devops` | `feature/devops-agent` |
| `casino-platform-qa` | `feature/qa-agent` |
| `casino-platform-security` | `feature/security-agent` |
| `casino-platform-reviewer` | `feature/reviewer-agent` |

The script skips any directory that already exists, so it is safe to re-run.

---

## Opening Claude Code in each worktree

Start a separate Claude Code session pointed at the worktree directory. Each session is fully isolated.

**Option A — Desktop app**

Open the folder in Claude Code via File → Open Folder, selecting the worktree directory (e.g. `casino-platform-backend`).

**Option B — CLI**

```powershell
# In separate terminal windows / tabs
claude --cwd ..\casino-platform-backend
claude --cwd ..\casino-platform-frontend
claude --cwd ..\casino-platform-qa
```

**Option C — VS Code + Claude Code extension**

Open each worktree directory as a separate VS Code workspace, then attach Claude Code to that workspace.

---

## One agent = one branch = one ticket

This is the hard rule that keeps parallel work safe:

```
one agent  →  one worktree  →  one branch  →  one ticket
```

- The Orchestrator assigns a ticket to an agent.
- The agent works **only** inside its own worktree directory.
- The agent creates commits **only** on its own branch.
- When the ticket is done, the agent opens a PR and **stops**.
- The Orchestrator reviews the PR and assigns the next ticket.

An agent must never:
- Check out a different branch inside its worktree mid-ticket.
- Push commits to another agent's branch.
- Edit files that belong to another agent's ticket scope.

---

## Never let two agents edit the same files

Ticket scopes are defined to be non-overlapping:

| Agent | File scope |
|-------|------------|
| Backend | `services/`, `packages/auth/`, `packages/config/` |
| Frontend | `apps/`, `packages/ui/` |
| DevOps | `docker-compose.yml`, `.github/`, `turbo.json`, root `package.json` |
| QA | `*.spec.ts`, `e2e/`, test fixtures |
| Security | Read-only reviewer — never writes source files |
| Code Reviewer | Read-only reviewer — never writes source files |

If two tickets touch overlapping files, the Orchestrator must sequence them (finish and merge the first before starting the second) rather than run them in parallel.

---

## Merging: always through PR and CI

No branch is merged by hand. The flow is always:

```
agent commits  →  agent pushes  →  agent opens PR  →  CI must pass  →  human merges
```

Use the GitHub CLI to open the PR from inside the worktree:

```powershell
& "C:\Program Files\GitHub CLI\gh.exe" pr create `
  --title "feat(api): add Prisma schema" `
  --body "Implements SPR-006. ..." `
  --base develop `
  --head feature/backend-agent
```

CI checks (`.github/workflows/ci.yml`) must be green before anyone merges:

```powershell
& "C:\Program Files\GitHub CLI\gh.exe" pr checks <PR-number> --watch
```

**Never merge a PR with a failing CI run.**  
**Never push directly to `develop` or `main`.**

---

## Removing the worktrees

When a sprint is complete and all PRs are merged:

```powershell
.\scripts\remove-worktrees.ps1
```

The script:
- Skips any worktree that has uncommitted changes (protects in-progress work).
- Deletes the local branch only if it has no unique commits ahead of `develop`.
- Prints a list of remaining worktrees when done.

---

## Keeping worktrees up to date

When `develop` has new merges (e.g. Backend merged first, Frontend needs those changes):

```powershell
# Inside the frontend worktree
git fetch origin
git rebase origin/develop
```

Rebase is preferred over merge to keep a linear history.

---

## Current project state

Sprint 1 complete: SPR-001 through SPR-005 (monorepo, Next.js apps, NestJS API, Docker, CI).

Sprint 2 target tickets for parallel agents:

| Ticket | Scope | Agent |
|--------|-------|-------|
| SPR-006 | Prisma schema | Backend |
| SPR-007 | JWT auth + refresh tokens | Backend |
| SPR-008 | RBAC guards + `@casino/auth` | Backend (after SPR-007) |
| SPR-009 | `ApiResponse<T>` types in `@casino/types` | Backend |
| SPR-010 | `@casino/ui` component stubs | Frontend |

SPR-006 and SPR-010 can run in parallel (non-overlapping file scopes).  
SPR-007 must wait for SPR-006 (needs the `User` model).  
SPR-008 must wait for SPR-007 (needs JWT infrastructure).
