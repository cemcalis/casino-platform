# EPIC-04 — Database

Define the Prisma schema, migrations, and seed data for all platform entities.

## Status: Not Started

## Tickets

| ID | Title | Status |
|----|-------|--------|
| SPR-030 | Prisma setup — schema, client, and global module | 🔲 Todo |
| SPR-031 | Initial migration — User, Wallet, LedgerEntry | 🔲 Todo |
| SPR-032 | Migration — GameSession and Leaderboard | 🔲 Todo |
| SPR-033 | Seed script — admin user and test data | 🔲 Todo |

## Schema Overview

- `User` — id, email, username, passwordHash, role, createdAt
- `Wallet` — userId (unique), balance (decimal), version (optimistic lock)
- `LedgerEntry` — userId, type, amount, balanceBefore, balanceAfter, referenceId
- `GameSession` — userId, gameType, betAmount, winAmount, result (JSON), serverSeed, nonce
- `Leaderboard` — userId, gameType, period, score, rank

## Acceptance Criteria

- [ ] `pnpm db:migrate` runs cleanly against a fresh Postgres instance
- [ ] `pnpm db:seed` creates the admin user (`admin@local.dev`)
- [ ] All financial columns use `Decimal`, not `Float`
- [ ] Indexes on `LedgerEntry.userId`, `LedgerEntry.createdAt`, `GameSession.userId`
