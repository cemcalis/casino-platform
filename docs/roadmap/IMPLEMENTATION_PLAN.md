# Implementation Plan

*Written for AI agents. This is the master execution plan for the social-casino MVP.*

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     pnpm Monorepo                        │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │  apps/web    │  │ apps/admin  │  │   services/api  │  │
│  │  (Next.js)   │  │  (Next.js)  │  │   (NestJS)     │  │
│  └──────┬───────┘  └──────┬──────┘  └────────┬────────┘  │
│         │                 │                   │           │
│  ┌──────┴─────────────────┴───────────────────┴────────┐ │
│  │            packages/types  packages/ui              │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Docker Compose                                      │ │
│  │  ┌──────────┐  ┌──────┐  ┌──────────────────────┐   │ │
│  │  │PostgreSQL│  │ Redis│  │  services/api        │   │ │
│  │  └──────────┘  └──────┘  └──────────────────────┘   │ │
│  └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Epic Dependency Graph

```
Epic 1 (Foundation)
  │
  ▼
Epic 2 (Auth) ──────────────────────────────────────────┐
  │                                                     │
  ├──► Epic 3 (Wallet) ───┐                            │
  │                        │                            │
  │                        ▼                            │
  │                  Epic 4 (Game Engine)               │
  │                        │                            │
  │                        ├──► Epic 5 (Social)         │
  │                        │                            │
  │                        ▼                            │
  │                  Epic 6 (Admin) ◄───────────────────┘
  │                                                     │
  └─────────────────────────────────────────────────────┤
                                                        │
                    Epic 7 (Compliance) ◄────────────────┤
                    Epic 8 (Quality) ◄──────────────────┘
                              │
                              ▼
                    Epic 9 (Launch)
```

### Parallel Tracks

| Track | Epics | Workers |
|-------|-------|---------|
| **Backend** | Epic 2 → 3 → 4 → 5 → 6 | 2-3 Feature Workers |
| **Frontend** | Epic 2(FE) → 3(FE) → 4(FE) → 5(FE) → 6(FE) → 7 | 2 Feature Workers |
| **Infrastructure** | Epic 1 → Epic 8(CI) → Epic 9(infra) | 1 Feature Worker |
| **QA** | Epic 8(E2E, load tests) — runs parallel to development | 1 QA Worker |
| **Documentation** | Epic 8(docs) — runs throughout | 1 Documentation Worker |

Max **6 agents** in parallel during peak sprint (Sprint 3).

---

## 3. Sprint Allocation

| Sprint | Epics | Tickets | Points | Agents Used | Key Deliverable |
|--------|-------|---------|--------|-------------|-----------------|
| S0 | Epic 1 | 8 | 14 | 4 | Project skeleton, CI, shared packages |
| S1 | Epic 2 (full), Epic 3 (backend) | 15 | 24 | 5 | Auth + Wallet MVP |
| S2 | Epic 3 (frontend), Epic 4 (full) | 10 | 20 | 5 | Gameplay MVP |
| S3 | Epic 5 (full), Epic 6 (backend start), Epic 6 (frontend admin shell) | 10 | 16 | 5 | Social + Admin start |
| S4 | Epic 6 (complete), Epic 7 (start), Epic 8 (start) | 12 | 19 | 5 | Admin complete, Compliance, QA |
| S5 | Epic 7 (complete), Epic 8 (complete), Epic 9 (start) | 12 | 18 | 4 | Hardening, Launch prep |
| S5+ | Epic 9 (complete) | 6 | 12 | 3 | Launch |

**Total**: ~6-7 sprints (~12-14 weeks) for MVP launch.

---

## 4. Agent Allocation Model

### 4.1 Role per Sprint

| Sprint | Feature Worker | Feature Worker | Feature Worker | Review Worker | QA Worker | Documentation |
|--------|---------------|---------------|---------------|--------------|-----------|---------------|
| S0 | S0-001, S0-006 | S0-002, S0-004 | S0-003, S0-005 | S0-007 | — | S0-008 docs |
| S1 | AUTH-001–005 | AUTH-006–009 | WAL-001–004 | AUTH-010–012 | WAL-005–006 | Write test plans |
| S2 | GAME-001–004 | GAME-005–008 | WAL-007–008 | SOC-001–003 | SOC-004 | API spec drafts |
| S3 | ADM-001–004 | ADM-005–007 | SOC-005–006 | ADM-008–010 | LEGAL-001–003 | Module READMEs |
| S4 | LEGAL-004–006 | QLTY-001–003 | QLTY-004–005 | QLTY-006–007 | QLTY-008 | Final docs pass |
| S5 | LNCH-001–003 | LNCH-004–005 | LNCH-006 | — | — | Launch docs |

### 4.2 Daily Agent Count

| Role | S0 | S1 | S2 | S3 | S4 | S5 |
|------|----|----|----|----|----|----|
| Feature Workers | 3 | 3 | 3 | 3 | 3 | 2 |
| Review Worker | 1 | 1 | 1 | 1 | 1 | 1 |
| QA Worker | 0 | 1 | 1 | 1 | 1 | 1 |
| Documentation Worker | 1 | 0 | 0 | 1 | 1 | 0 |
| **Total** | **5** | **5** | **5** | **6** | **6** | **4** |

---

## 5. Critical Path

The critical path determines the minimum MVP timeline. It goes through:

```
S0 (Foundation)
  → S1 (Auth + Wallet backend)
    → S2 (Game Engine)
      → S3 (Social: leaderboard needs game data)
        → S4 (Quality: E2E needs everything working)
          → S5+ (Launch)
```

**Length**: 12 weeks (assuming no blockers).

### What Extends the Critical Path
- S0 scaffold takes more than 1 week (adds 1 week to all sprints)
- Game engine (S2) exceeds sprint due to complexity (adds 1-2 weeks)
- Security audit reveals compliance issues (adds 1-2 weeks for legal sign-off)

### What Does NOT Extend the Critical Path
- Admin panel (Epic 6) — can be deferred to post-MVP if needed
- Frontend polish — can be iterated post-launch
- Leaderboards — can ship without them initially

---

## 6. Parallel Execution Map

### Sprint 1 — Parallel Execution

```
Day 1-5                    Day 6-10
│                          │
AUTH-001 (registration)    AUTH-002 (login JWT)
  │                          │
  ├── AUTH-006 (profile)     ├── AUTH-003 (refresh)
  ├── AUTH-008 (rate limit)  ├── AUTH-005 (password reset)
  ├── WAL-001 (create wallet)│
  │                          ├── AUTH-009 (FE register)
  │                          ├── AUTH-010 (FE login)
  │                          ├── WAL-002 (balance endpoint)
  │                          ├── WAL-003 (ledger endpoint)
  │                          └── WAL-004 (admin grant)
```

**5 agents**: 2 backend auth, 1 backend wallet, 1 frontend auth, 1 wallet frontend prep.

### Sprint 2 — Parallel Execution

```
Day 1-5                    Day 6-10
│                          │
GAME-001 (CSPRNG) ──► GAME-002 (abstraction)
                          │
                          ├── GAME-003 (slot logic)
                          │     │
                          │     └── GAME-004 (spin endpoint)
                          │
                          ├── GAME-005 (history endpoint)
                          ├── GAME-006 (provably fair)
                          ├── GAME-007 (FE spin UI)
                          │
WAL-007 (FE wallet) ──► WAL-008 (FE purchase placeholder)
```

**5 agents**: 2 game backend, 1 game frontend, 1 wallet frontend, 1 social prep.

---

## 7. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Game engine complexity underestimated | Medium | High (extends critical path) | Build placeholder game first (3-reel, 1 payline); extend in later sprints |
| Legal compliance requires changes | Low | High | Run legal review in Sprint 3, not after Sprint 5 |
| CI/CD pipeline issues slow down all agents | Medium | Medium | Dedicate S0 ticket to CI; keep a buffer day in each sprint |
| Agent PR review queue blocks feature workers | Medium | Medium | Dedicate 1 Review Worker per 3 Feature Workers |
| PostgreSQL migration changes cause data loss | Low | Critical | Always test migrations on staging first; keep rollback scripts |
| Virtual currency balance race conditions | Medium | High | Optimistic locking on wallet table; integration test concurrent spins |
| Scope creep on "just one more game type" | Medium | Medium | MVP ships exactly 1 game type (slot); all others are post-MVP |

---

## 8. Post-MVP Backlog (Future)

These items are explicitly **out of scope** for the MVP but are captured for future planning:

| Item | Rationale |
|------|-----------|
| Additional game types (blackjack, poker, etc.) | MVP = 1 slot game only |
| Multi-currency virtual wallets (coins, gems, etc.) | Single virtual currency for MVP |
| In-app purchases of virtual currency | Phase 2 feature; MVP uses admin grants only |
| Tournament mode | Phase 2 social feature |
| Mobile app (React Native) | Post-MVP; web-first |
| Real-money gambling features | **Never** — legal boundary |
| Payment gateway integration | **Never** — legal boundary |
| User-to-user transfers | **Never** — legal boundary |
| Referral program | Phase 2 growth feature |
| Push notifications | Phase 2 engagement feature |
| Internationalization / i18n | Phase 3; English only for MVP |
| Accessibility (WCAG) audit | Phase 3; basic a11y in MVP |
