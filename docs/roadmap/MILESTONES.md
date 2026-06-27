# Milestones

*Written for AI agents. Each milestone has a clear definition, and agents can check their progress against the requirements.*

---

## M0 — Project Skeleton (End of Sprint 0)

**Target**: Day 14  
**Gate**: Everything needed to start writing feature code.

### Requirements
- [ ] Monorepo boots with `pnpm dev` across all packages
- [ ] API responds at `GET /api/v1/health` with `{ status: "ok" }`
- [ ] PostgreSQL + Redis start via `docker compose up`
- [ ] Prisma migrations run, seed creates admin user
- [ ] CI pipeline passes on `develop`
- [ ] Shared types package builds and is importable by API and frontends
- [ ] Shared UI components render in both `apps/web` and `apps/admin`
- [ ] ESLint + Prettier enforce standards on commit
- [ ] Docker compose runs full stack (PostgreSQL + Redis + API)

### Agent Sign-off
- [ ] Feature Worker S0-001: Scaffold complete
- [ ] Feature Worker S0-006: API skeleton boots
- [ ] Tech Lead: CI green on `develop`

---

## M1 — Auth & Wallet MVP (End of Sprint 1)

**Target**: Day 28  
**Gate**: Users can register, log in, and view their virtual currency balance.

### Requirements
- [ ] User registration with email + password (hashed, validated)
- [ ] JWT login with access token + refresh token rotation
- [ ] Token revocation on logout
- [ ] Age verification collected during registration (date of birth, 18+ check)
- [ ] Wallet created automatically on registration
- [ ] `GET /api/v1/wallet/balance` returns current balance
- [ ] `GET /api/v1/wallet/transactions` returns paginated ledger
- [ ] Admin can grant virtual currency via admin endpoint
- [ ] Rate limiting on auth endpoints
- [ ] Frontend: Registration page (validated, error states)
- [ ] Frontend: Login page (JWT stored, redirect to lobby)
- [ ] Frontend: Wallet dashboard shows balance + transaction list
- [ ] Frontend: Auth guard redirects unauthenticated users to login

### Agent Sign-off
- [ ] QA Worker: Registration + Login E2E flow passes
- [ ] Review Worker: All auth endpoints reviewed for security
- [ ] Review Worker: Compliance check — no real-money or payment paths

---

## M2 — Gameplay MVP (End of Sprint 2)

**Target**: Day 42  
**Gate**: Users can play a slot machine game with virtual currency.

### Requirements
- [ ] CSPRNG service generates secure random numbers server-side
- [ ] Slot machine game logic: reels, paylines, win calculation
- [ ] `POST /api/v1/games/slot/spin`: bets virtual currency, resolves result
- [ ] Balance is deducted on bet and credited on win (atomic)
- [ ] All balance changes recorded in append-only ledger
- [ ] Game session history queryable
- [ ] Provably fair verification: client seed + server seed + nonce → result
- [ ] Frontend: Game lobby with slot machine selection
- [ ] Frontend: Spin button triggers animation and shows result
- [ ] Frontend: Game history view

### Agent Sign-off
- [ ] QA Worker: Gameplay E2E (login → spin → verify balance)
- [ ] Security Worker: CSPRNG implementation reviewed
- [ ] Review Worker: No client-side trust in game outcomes
- [ ] Review Worker: Compliance check — no real-money gambling mechanics

---

## M3 — Social & Admin (End of Sprint 3/4)

**Target**: Day 70  
**Gate**: Players see leaderboards; admins manage users, games, and transactions.

### Requirements
- [ ] Leaderboard calculated per game type (DAILY, WEEKLY, ALL_TIME)
- [ ] `GET /api/v1/leaderboard?gameType=slot&period=weekly` returns ranked list
- [ ] Public user profiles (username, stats, recent wins)
- [ ] Frontend: Leaderboard page with period filter
- [ ] Admin login with RBAC (admin role required)
- [ ] Admin: User list with search and pagination
- [ ] Admin: Grant virtual currency to any user
- [ ] Admin: View transaction log with filters
- [ ] Admin: Configure game parameters (RTP, paylines, etc.)
- [ ] Admin: Dashboard with aggregate stats (active users, total bets, etc.)
- [ ] Frontend Admin: Fully functional admin panel

### Agent Sign-off
- [ ] QA Worker: Admin grant → verify balance reflects in player wallet
- [ ] QA Worker: Leaderboard reflects real gameplay data
- [ ] Security Worker: RBAC tested (non-admin cannot access admin endpoints)

---

## M4 — Compliance & Hardening (End of Sprint 4/5)

**Target**: Day 84  
**Gate**: Platform meets legal requirements and quality bar.

### Requirements
- [ ] Terms of Service page (static, in-app)
- [ ] Privacy Policy page (static, in-app)
- [ ] Age gate: DOB required at registration; under-18 rejected
- [ ] Age gate modal on first visit (confirm age)
- [ ] Responsible gaming information page
- [ ] Session timeout warning (15 min warning → 30 min forced logout)
- [ ] E2E tests cover: registration, login, gameplay, wallet, admin grant
- [ ] Full regression suite passes
- [ ] Security audit complete (dependency scan + OWASP top 10 review)
- [ ] Load test results: 500 concurrent users, P95 < 500ms
- [ ] All 8 compliance checklist items from QUALITY_POLICY.md pass
- [ ] OpenAPI spec auto-generated for all endpoints
- [ ] All public API endpoints documented

### Agent Sign-off
- [ ] Legal: Compliance checklist signed off
- [ ] QA Worker: Full regression suite green
- [ ] Tech Lead: Load test results acceptable
- [ ] Review Worker: No compliance violations in codebase

---

## M5 — Launch (End of Sprint 5+)

**Target**: Day 98  
**Gate**: Platform is live and accepting users (invite-only, then public).

### Requirements
- [ ] Staging environment deployed and tested
- [ ] Production environment provisioned
- [ ] Monitoring + alerting configured (P95 latency, error rate, business metrics)
- [ ] Load test on staging passes at target concurrency
- [ ] Legal compliance sign-off in writing
- [ ] Rollback plan documented and tested
- [ ] Soft launch: invite-only, max 100 users, monitored for 1 week
- [ ] All P0/P1 bugs resolved
- [ ] Public launch: all features enabled, marketing site points to live URL

### Agent Sign-off
- [ ] Tech Lead: Production deploy successful
- [ ] Tech Lead: Monitoring shows healthy metrics after 1 hour
- [ ] Product: Soft launch feedback incorporated

---

## Milestone Tracker

```
M0 ─── M1 ─── M2 ─── M3 ─────── M4 ─── M5
│      │      │      │          │      │
S0     S1     S2     S3    S4   S5     S5+
│      │      │      │          │      │
14d    28d    42d    70d        84d    98d
```

Each milestone gates the next. No milestone is considered complete until all requirements are verified by the assigned agents.
