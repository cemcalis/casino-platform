# EPIC-01 — Foundation

Establish the monorepo scaffold, tooling, CI/CD, and infrastructure so all other epics can build on a stable base.

## Status: In Progress

## Tickets

| ID | Title | Status |
|----|-------|--------|
| SPR-001 | Monorepo scaffold (Turborepo + pnpm workspaces) | ✅ Done |
| SPR-002 | Next.js apps scaffold | 🔲 Todo |
| SPR-003 | NestJS API scaffold | 🔲 Todo |
| SPR-004 | Docker — PostgreSQL + Redis | 🔲 Todo |
| SPR-005 | GitHub Actions CI | 🔲 Todo |

## Acceptance Criteria

- [ ] All apps and services boot locally with a single `pnpm dev`
- [ ] CI pipeline runs lint, typecheck, build, and test on every PR
- [ ] Docker Compose brings up Postgres and Redis with health checks
- [ ] Developer setup documented in README
