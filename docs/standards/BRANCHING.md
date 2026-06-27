# Branching Strategy

## Branches

| Branch | Purpose | Source |
|--------|---------|--------|
| `main` | Production-ready code. Protected — no direct pushes. | — |
| `develop` | Integration branch for the next release. Protected. | `main` |
| `feature/*` | New features or enhancements. | `develop` |
| `fix/*` | Bug fixes. | `develop` |
| `hotfix/*` | Urgent production fixes. | `main` |
| `release/*` | Release preparation (version bumps, changelog). | `develop` |

## Workflow

```
main ────┬─────────────────────── hotfix/urgent-fix ──► merge ──► tag vX.Y.Z
         │
develop ─┼──────────┬─────────┬─────────┬──────────────────────────────
         │          │         │         │
         │   feature/login   fix/typo  release/v1.0
         │          │         │         │
         └──────────┴─────────┴─────────┘  (merge to main + tag)
```

## Rules
1. Branch from `develop` for all feature and fix work.
2. Name branches with the ticket ID and a short slug: `feature/PROJ-42-user-profile`.
3. Keep branches short-lived (≤3 days). If longer, rebase onto `develop` daily.
4. Squash-merge feature/fix branches into `develop` with a clean commit message.
5. Merge `develop` into `main` only via a release branch.
6. Hotfix branches merge directly to `main` **and** back to `develop`.

## Commit Messages
Follow Conventional Commits:
```
<type>(<scope>): <description>

[optional body]
```
Types: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `style`, `perf`.

Examples:
- `feat(wallet): add virtual-currency balance endpoint`
- `fix(auth): handle expired token refresh gracefully`
- `test(game): add unit tests for spin logic`

## PR Requirements
- Title must match the commit convention.
- Description must link to the ticket and summarize changes.
- CI must pass (lint, typecheck, test, build).
- At least one approving review required.
- No PR larger than 400 lines of changed code (exclude generated files).
