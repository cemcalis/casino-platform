# EPIC-03 — Backend

Build the NestJS API service and WebSocket realtime service that power all platform features.

## Status: Not Started

## Tickets

| ID | Title | Status |
|----|-------|--------|
| SPR-020 | NestJS app — global config, exception filter, validation pipe | 🔲 Todo |
| SPR-021 | Health endpoint `GET /api/v1/health` | 🔲 Todo |
| SPR-022 | User module — CRUD and profile endpoints | 🔲 Todo |
| SPR-023 | Wallet module — balance and ledger endpoints | 🔲 Todo |
| SPR-024 | Game session module — create, resolve, history | 🔲 Todo |
| SPR-025 | Leaderboard module — query and ranking | 🔲 Todo |
| SPR-026 | Realtime service — WebSocket gateway for live events | 🔲 Todo |

## Acceptance Criteria

- [ ] `GET /api/v1/health` returns `{ status: "ok", timestamp }`
- [ ] All responses use the `ApiResponse<T>` envelope from `@casino/types`
- [ ] All endpoints validated with class-validator or zod
- [ ] Rate limiting applied to all public endpoints
- [ ] No client-side trust for balance or win calculations
