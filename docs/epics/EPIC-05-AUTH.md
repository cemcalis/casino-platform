# EPIC-05 — Authentication & Authorization

Implement JWT-based authentication with refresh token rotation and role-based access control across the platform.

## Status: Not Started

## Tickets

| ID | Title | Status |
|----|-------|--------|
| SPR-040 | `@casino/auth` package — JWT sign/verify, password hashing | 🔲 Todo |
| SPR-041 | Auth module — register, login, logout endpoints | 🔲 Todo |
| SPR-042 | Refresh token rotation | 🔲 Todo |
| SPR-043 | RBAC guards — PLAYER, ADMIN, SUPPORT roles | 🔲 Todo |
| SPR-044 | Auth middleware for Next.js apps | 🔲 Todo |

## Acceptance Criteria

- [ ] `POST /api/v1/auth/login` returns access token + refresh token
- [ ] Access token expires in 15 minutes; refresh token in 7 days
- [ ] Refresh token is rotated on every use (old token invalidated)
- [ ] Role guards protect all admin and finance endpoints
- [ ] No passwords or tokens logged
