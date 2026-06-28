# Security Audit Findings — SPR-011 (Authentication System)

**Auditor:** Security Reviewer Agent  
**Date:** 2026-06-28  
**Scope:** SPR-011-A (JWT auth), SPR-011-B (RBAC), SPR-011-C (Frontend auth forms)  
**Verdict:** BLOCK → resolved by SPR-011-F (PR #22)

---

## Checklist

| Item | Result |
|------|--------|
| JWT secrets loaded from env vars — never hardcoded | FIXED (SPR-011-F) |
| Refresh token rotation implemented and old tokens invalidated | PASS |
| Passwords hashed with bcrypt cost ≥ 12 — never stored plain | PASS |
| All API inputs validated with class-validator before use | PASS |
| RBAC guards applicable to protected endpoints | FIXED (SPR-011-F global guards) |
| No wallet balance or win value accepted from client payload | PASS |
| No sensitive fields exposed in API responses | PASS + Prisma select added (SPR-011-F) |
| No real-money, payment, or financial transaction logic | PASS |
| No secrets committed to .env.example or workflow files | FIXED (SPR-011-F) |
| Refresh token reuse detection implemented | PASS |
| Token type validation (access vs refresh not interchangeable) | PASS |
| Username/email uniqueness enforced before user creation | PASS |

---

## Findings

### Finding 1 — Hardcoded fallback JWT secret *(Critical → FIXED in SPR-011-F)*
**File:** `services/api/src/auth/strategies/jwt.strategy.ts:11`  
**Fix:** Removed `?? 'fallback'`. Strategy throws at startup if `JWT_ACCESS_SECRET` unset.

### Finding 2 — Refresh token in JSON response body *(High → SPR-012)*
**File:** `services/api/src/auth/auth.service.ts:93`  
**Description:** Refresh token returned in JSON body is XSS-accessible. Should be an HttpOnly cookie.  
**Status:** Tracked as SPR-012 (HttpOnly cookie migration).

### Finding 3 — No global authentication guard *(Medium → FIXED in SPR-011-F)*
**Fix:** `JwtAuthGuard` and `RolesGuard` registered as `APP_GUARD` in `AppModule`. `@Public()` decorator exempts open routes. Auth endpoints and `GET /health` marked `@Public()`.

### Finding 4 — Prisma queries fetch sensitive fields *(Medium → FIXED in SPR-011-F)*
**Fix:** All `prisma.user` queries in `auth.service.ts` now use explicit `select` excluding `passwordHash`/`refreshTokenHash` except where required.

### Finding 5 — Refresh token hashed at bcrypt cost 10 *(Medium → FIXED in SPR-011-F)*
**Fix:** Added `hashRefreshToken`/`compareRefreshToken` (cost 12) to `@casino/auth`. `auth.service.ts` now uses these; direct `bcrypt` import removed.

### Finding 6 — Distinct error messages reveal refresh session state *(Low → FIXED in SPR-011-F)*
**Fix:** Both `refreshTokenHash` null and hash-mismatch cases now return `'Invalid refresh token'`.

### Finding 7 — Weak secret placeholders in .env.example *(Low → FIXED in SPR-011-F)*
**Fix:** Replaced `change-me-*` with `REPLACE_WITH_32_PLUS_BYTE_RANDOM_HEX` and added `crypto.randomBytes(32)` generation instructions.

### Finding 8 — Refresh rotation lacks atomic guard *(Info → SPR-013)*
**Description:** `refresh` performs `bcrypt.compare` then `prisma.update` without a transaction lock.  
**Status:** Tracked as SPR-013 (Redis distributed lock for realtime service).

### Finding 9 — Access token in sessionStorage *(Info → SPR-012)*
**Description:** `sessionStorage` is JS-accessible. Prefer in-memory (React state).  
**Status:** Resolved as part of SPR-012 frontend refactor.
