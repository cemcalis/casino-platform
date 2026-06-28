# Auto PR Merge Skill

## Purpose

Automate the full delivery pipeline for a completed ticket: commit, push, PR creation, CI check watching, and optional merge — safely and with human approval at the merge step.

This skill never shortcuts the pipeline. Every step must complete successfully before the next begins.

---

## When to Use

Invoke this skill when:

- A ticket is complete and all local checks have passed (`pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`)
- The working branch has staged or unstaged changes ready to ship
- A PR needs to be created and CI monitored in one flow

Do **not** invoke this skill mid-ticket or when local checks are still failing.

---

## Inputs Required

Collect these before starting:

| Input | Example |
|-------|---------|
| **Ticket ID** | `SPR-006` |
| **Commit message** | `feat(api): add Prisma schema` |
| **PR title** | `feat(api): add Prisma schema` |
| **PR description** | Multi-line body (bullets preferred) |
| **Branch name** | `feature/SPR-006-prisma-schema` |
| **Base branch** | `develop` (default) or `main` for docs/infra |

---

## GitHub CLI Path

Always use the full path:

```powershell
C:\Program Files\GitHub CLI\gh.exe
```

Assign it to a variable at the top of any script to avoid repetition:

```powershell
$gh = "C:\Program Files\GitHub CLI\gh.exe"
```

---

## Required Flow

Execute every step in order. Stop and report if any step fails.

### Step 1 — Verify working state

```powershell
git status
git diff --stat
```

Confirm only ticket-scoped files are modified. If unrelated files appear, stop and ask the user to clarify before staging anything.

### Step 2 — Stage only affected files

```powershell
# Stage specific files — never use "git add ." or "git add -A"
git add services/api/prisma/schema.prisma
git add services/api/prisma/migrations/
```

Review the staged list with `git diff --cached --stat` before committing.

### Step 3 — Commit

```powershell
git commit -m "feat(api): add Prisma schema

Agent: Backend Agent
Ticket: SPR-006

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

Commit message must follow Conventional Commits with `Agent:` and `Ticket:` trailers.

### Step 4 — Push

```powershell
git push -u origin feature/SPR-006-prisma-schema
```

Use `-u` on first push to set the upstream tracking branch.

### Step 5 — Create PR

```powershell
& "C:\Program Files\GitHub CLI\gh.exe" pr create `
  --title "feat(api): add Prisma schema" `
  --body @'
## Summary
- Adds User, Wallet, LedgerEntry, GameSession, Leaderboard models
- Configures PostgreSQL datasource
- Adds initial migration

## Ticket
SPR-006

## Test plan
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] Migration runs cleanly via `npx prisma migrate dev`
- [ ] CI green

Agent: Backend Agent
'@ `
  --base develop `
  --head feature/SPR-006-prisma-schema
```

Capture the returned PR URL and report it to the user.

### Step 6 — Watch CI checks

```powershell
& "C:\Program Files\GitHub CLI\gh.exe" pr checks <PR-number> --watch
```

Wait for all checks to complete. Do not proceed until every check shows `pass`.

If any check fails:
1. Report the failing step and its log URL to the user.
2. Stop — do not merge.
3. Fix the issue, push a new commit to the same branch, and re-watch from Step 6.

### Step 7 — Request human approval before merge

When all checks pass, report the result and **ask the human**:

```
All CI checks passed for PR #<number>.
PR URL: https://github.com/cemcalis/casino-platform/pull/<number>

Do you want me to merge this PR? (yes / no)
```

Do **not** merge automatically. Wait for explicit approval.

### Step 8 — Merge (only after approval)

```powershell
& "C:\Program Files\GitHub CLI\gh.exe" pr merge <PR-number> --squash --delete-branch
```

Use squash merge to keep `develop` history linear. Delete the remote branch after merge.

---

## Hard Rules

| Rule | Detail |
|------|--------|
| Never commit unrelated files | Stage only the files the ticket touches. Always review `git diff --cached` before committing. |
| Never merge with failing or pending checks | Step 6 must show all green before Step 7 is reached. |
| Never use exposed tokens | Do not pass GitHub tokens as CLI arguments or environment variables in plain text. Use the system credential store (`git credential` / Windows Credential Manager). |
| Never bypass CI | No `--no-verify`, no skipping workflow steps, no force-pushing to bypass branch protection. |
| Never merge without human approval | Step 7 is a hard gate. Auto-merge is disabled until the project owner explicitly enables it for a specific branch or ticket class. |
| Never push to `main` or `develop` directly | All changes go through a PR. `main` accepts only `release/*` merges. |
| Never merge a PR over 400 LOC | Excluding generated files. Split the ticket first. |

---

## Output Format

Report these four items when the skill completes:

```
Commit : abc1234  feat(api): add Prisma schema
PR     : https://github.com/cemcalis/casino-platform/pull/9
CI     : PASS — lint ✓  typecheck ✓  test ✓  build ✓
Merge  : awaiting human approval / merged to develop / skipped (CI failed)
```

If any step fails, replace the remaining fields with the failure reason and stop.

---

## Auto-Merge Policy

Auto-merge (skipping Step 7) is **disabled by default**.

It may be enabled by the project owner for a specific ticket class (e.g. documentation-only PRs) by adding an explicit note in the sprint doc or in the ticket instructions. That permission applies to that ticket only — it does not carry over to the next ticket.

When in doubt, always ask before merging.
