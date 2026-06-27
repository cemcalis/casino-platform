# Backlog

*Full product backlog for the social-casino MVP. Tickets are grouped by Epic and ordered by priority within each Epic. Dependencies are explicit so agents can plan their pick order.*

*Estimate scale: 1 point = ~half day of agent work. Max 3 points per ticket.*

---

## Epic 1 — Foundation (Sprint 0)

| ID | Title | Est. | Dependencies | Parallel Group |
|----|-------|------|--------------|----------------|
| S0-001 | Initialize Monorepo Scaffold | 2 | — | A — Wave 1 |
| S0-002 | Configure ESLint + Prettier + Pre-commit Hooks | 1 | S0-001 | B — Wave 2 |
| S0-003 | Docker Compose — PostgreSQL + Redis | 1 | S0-001 | B — Wave 2 |
| S0-004 | Shared Types Package | 2 | S0-001 | B — Wave 2 |
| S0-005 | Shared UI Components Package | 2 | S0-001 | B — Wave 2 |
| S0-006 | NestJS API Skeleton | 2 | S0-001, S0-004 | B — Wave 2 |
| S0-007 | CI/CD Pipeline | 2 | S0-001, S0-006 | C — Wave 3 |
| S0-008 | Database Schema — Initial Migration | 2 | S0-006 | C — Wave 3 |

---

## Epic 2 — Authentication & User Management (Sprint 1)

| ID | Title | Est. | Dependencies | Parallel Group |
|----|-------|------|--------------|----------------|
| AUTH-001 | Auth Module — Registration Endpoint | 2 | S0-006, S0-008 | A |
| AUTH-002 | Auth Module — Login Endpoint (JWT) | 2 | AUTH-001 | B |
| AUTH-003 | Auth Module — Refresh Token Rotation | 2 | AUTH-002 | C |
| AUTH-004 | Auth Module — Logout + Token Revocation | 1 | AUTH-003 | D |
| AUTH-005 | Auth Module — Password Reset Flow | 2 | AUTH-002 | C |
| AUTH-006 | User Module — Profile GET/PATCH Endpoints | 1 | AUTH-002 | C |
| AUTH-007 | User Module — Age Verification Guard | 1 | AUTH-002 | C |
| AUTH-008 | Auth Module — Rate Limiting on All Auth Endpoints | 1 | AUTH-002 | C |
| AUTH-009 | Frontend — Registration Page | 2 | S0-005, AUTH-001 | D |
| AUTH-010 | Frontend — Login Page | 2 | S0-005, AUTH-002 | D |
| AUTH-011 | Frontend — Password Reset Pages | 2 | S0-005, AUTH-005 | E |
| AUTH-012 | Frontend — Auth Guard (redirect to login) | 1 | AUTH-010 | E |

**Parallel execution**: Up to 5 agents simultaneously (groups A→E).

---

## Epic 3 — Virtual Wallet System (Sprint 1/2)

| ID | Title | Est. | Dependencies | Parallel Group |
|----|-------|------|--------------|----------------|
| WAL-001 | Wallet Module — Create Wallet on Registration | 1 | AUTH-001, S0-008 | A |
| WAL-002 | Wallet Module — Balance Endpoint | 1 | WAL-001 | B |
| WAL-003 | Wallet Module — Ledger Query Endpoint (paginated) | 2 | WAL-001 | B |
| WAL-004 | Wallet Module — Admin Grant Virtual Currency | 2 | WAL-001, AUTH-003 | B |
| WAL-005 | Wallet Module — Optimistic Locking on Balance Updates | 2 | WAL-001 | B |
| WAL-006 | Wallet Module — Transaction History Export (CSV) | 1 | WAL-003 | C |
| WAL-007 | Frontend — Wallet Dashboard (balance + transaction list) | 2 | S0-005, WAL-002, WAL-003 | C |
| WAL-008 | Frontend — Virtual Currency Purchase Flow (placeholder UI only) | 1 | WAL-007 | D |

**Parallel execution**: Up to 4 agents simultaneously (groups A→D).

---

## Epic 4 — Game Engine (Sprint 2)

| ID | Title | Est. | Dependencies | Parallel Group |
|----|-------|------|--------------|----------------|
| GAME-001 | Game Module — CSPRNG Service | 2 | S0-006 | A |
| GAME-002 | Game Module — Game Abstraction (interface, base class, registry) | 2 | GAME-001 | B |
| GAME-003 | Game Module — Slot Machine Game Logic | 3 | GAME-002 | C |
| GAME-004 | Game Module — Spin Endpoint (bet → result → ledger) | 3 | GAME-003, WAL-005 | D |
| GAME-005 | Game Module — Game Session History Endpoint | 1 | GAME-004 | E |
| GAME-006 | Game Module — Provably Fair Verification Endpoint | 2 | GAME-003 | D |
| GAME-007 | Frontend — Spin Button + Result Animation Shell | 2 | S0-005, GAME-004 | E |
| GAME-008 | Frontend — Game Session History View | 1 | GAME-005 | F |

**Parallel execution**: Up to 5 agents (groups A→F, with sequential chains within groups).

---

## Epic 5 — Social Features (Sprint 3)

| ID | Title | Est. | Dependencies | Parallel Group |
|----|-------|------|--------------|----------------|
| SOC-001 | Leaderboard Module — Score Calculation Service | 2 | GAME-004 | A |
| SOC-002 | Leaderboard Module — Get Leaderboard Endpoint (DAILY/WEEKLY/ALL_TIME) | 2 | SOC-001 | B |
| SOC-003 | Leaderboard Module — Scheduled Job to Recalculate Periods | 1 | SOC-001 | B |
| SOC-004 | Frontend — Leaderboard Page | 2 | S0-005, SOC-002 | C |
| SOC-005 | User Module — Public Profile Endpoint | 1 | AUTH-002 | A |
| SOC-006 | Frontend — Public Profile Page | 1 | SOC-005 | C |

**Parallel execution**: Up to 3 agents (groups A→C).

---

## Epic 6 — Admin Panel (Sprint 3/4)

| ID | Title | Est. | Dependencies | Parallel Group |
|----|-------|------|--------------|----------------|
| ADM-001 | Admin Module — RBAC Guard (Admin role verification) | 1 | AUTH-003 | A |
| ADM-002 | Admin Module — User List Endpoint (paginated, searchable) | 2 | ADM-001 | B |
| ADM-003 | Admin Module — User Detail + Virtual Currency Grant | 2 | ADM-002, WAL-004 | C |
| ADM-004 | Admin Module — Game Configuration CRUD | 2 | ADM-001, GAME-002 | B |
| ADM-005 | Admin Module — Transaction Log Viewer | 2 | ADM-001, WAL-003 | B |
| ADM-006 | Admin Module — Dashboard Stats Endpoint | 2 | ADM-001 | B |
| ADM-007 | Frontend Admin — Login + Layout Shell | 2 | S0-005, ADM-001 | C |
| ADM-008 | Frontend Admin — User Management Pages | 2 | ADM-003, ADM-007 | D |
| ADM-009 | Frontend Admin — Game Configuration Pages | 2 | ADM-004, ADM-007 | D |
| ADM-010 | Frontend Admin — Dashboard Page | 2 | ADM-006, ADM-007 | D |

**Parallel execution**: Up to 4 agents.

---

## Epic 7 — Compliance & Legal (Sprint 4/5)

| ID | Title | Est. | Dependencies | Parallel Group |
|----|-------|------|--------------|----------------|
| LEGAL-001 | Frontend — Terms of Service Page | 1 | S0-005 | A |
| LEGAL-002 | Frontend — Privacy Policy Page | 1 | S0-005 | A |
| LEGAL-003 | Age Gate — Server-side Age Verification on Registration | 1 | AUTH-001 | A |
| LEGAL-004 | Frontend — Age Gate Modal on First Visit | 1 | S0-005 | B |
| LEGAL-005 | Frontend — Responsible Gaming Info Page | 1 | S0-005 | A |
| LEGAL-006 | Session Timeout Warning (frontend + backend) | 2 | AUTH-010, AUTH-003 | B |

**Parallel execution**: Up to 2 agents (groups A→B).

---

## Epic 8 — Quality & Hardening (Sprint 4/5)

| ID | Title | Est. | Dependencies | Parallel Group |
|----|-------|------|--------------|----------------|
| QLTY-001 | E2E Test Suite — Registration + Login Journey | 2 | AUTH-010, S0-005 | A |
| QLTY-002 | E2E Test Suite — Gameplay Loop (login → spin → check balance) | 2 | GAME-007, WAL-007 | A |
| QLTY-003 | E2E Test Suite — Admin Grant Virtual Currency | 2 | ADM-008 | B |
| QLTY-004 | Security Audit — Dependency Scan + Pen Test Setup | 2 | S0-007 | A |
| QLTY-005 | Performance — Load Test with k6 (auth + balance + spin) | 2 | GAME-004 | B |
| QLTY-006 | Documentation — API OpenAPI Spec Auto-generation | 1 | S0-006 | A |
| QLTY-007 | Documentation — Module READMEs for All Modules | 2 | All epics | C |
| QLTY-008 | Bug Bash — Dedicated Sprint for Bug Fixes | 3 | All epics | D |

**Parallel execution**: Up to 4 agents.

---

## Epic 9 — Launch (Sprint 5+)

| ID | Title | Est. | Dependencies | Parallel Group |
|----|-------|------|--------------|----------------|
| LNCH-001 | Staging Environment Setup | 1 | S0-007 | A |
| LNCH-002 | Production Environment Setup | 1 | LNCH-001 | B |
| LNCH-003 | Monitoring + Alerting (Datadog / Grafana) | 2 | S0-007 | A |
| LNCH-004 | Load Testing on Staging | 2 | QLTY-005, LNCH-001 | B |
| LNCH-005 | Legal Compliance Sign-off | 1 | LEGAL-001–006 | C |
| LNCH-006 | Soft Launch (invite-only) | 2 | All above | D |
| LNCH-007 | Public Launch | 1 | LNCH-006 | E |

---

## Backlog Summary

| Epic | Tickets | Total Points | Sprints |
|------|---------|-------------|---------|
| 1 — Foundation | 8 | 14 | Sprint 0 |
| 2 — Authentication | 12 | 20 | Sprint 1 |
| 3 — Virtual Wallet | 8 | 12 | Sprint 1/2 |
| 4 — Game Engine | 8 | 16 | Sprint 2 |
| 5 — Social | 6 | 9 | Sprint 3 |
| 6 — Admin Panel | 10 | 19 | Sprint 3/4 |
| 7 — Compliance | 6 | 7 | Sprint 4/5 |
| 8 — Quality | 8 | 16 | Sprint 4/5 |
| 9 — Launch | 7 | 10 | Sprint 5+ |
| **Total** | **73** | **123** | **6 sprints (~12 weeks)** |
