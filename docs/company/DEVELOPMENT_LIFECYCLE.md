# Development Lifecycle

*Written for AI agents. This defines how work flows from ticket to production.*

---

## 1. Definition of Ready

A ticket is ready for an agent to pick up only when ALL of the following are true:

| Criteria | Check |
|----------|-------|
| Title follows `[Type] Short description` | e.g. `[Feature] Add virtual-currency balance endpoint` |
| Acceptance criteria are specific, testable, and listed as checkboxes | ✅ "Balance returns 0 for new users" ❌ "Balance works" |
| Mockups or API contracts are attached or linked | Swagger snippet, Figma link, or text description of UI behavior |
| Dependencies are identified and either resolved or marked as blockers | No implicit "this needs X" without a ticket reference |
| Scope boundary is defined | Explicit list of what is NOT in scope |
| Estimated at 1-3 story points (1 point = ~half day of agent work) | Larger tickets must be split |
| Label includes the agent role required | `role:feature-worker`, `role:bug-worker`, etc. |

An agent **must not** start work on a ticket that is not Ready. If assigned an unready ticket, the agent tags the Product team in the ticket with what is missing.

---

## 2. Definition of Done

A ticket is Done only when ALL of the following are true:

| Criteria | Check |
|----------|-------|
| Acceptance criteria are implemented and passing | Automated test proves each criterion |
| Unit tests exist for all new/modified logic | Minimum 80% line coverage on the changed code |
| Integration tests exist for all new endpoints | Happy path + 2 error cases minimum |
| E2E test exists (if user-facing feature) | Playwright test covers the critical user journey |
| Lint and typecheck pass | `npm run lint` and `npm run typecheck` exit zero |
| All existing tests still pass | No regressions introduced |
| Documentation is updated | Module README, API spec, or ADR as applicable |
| PR is merged to `develop` | Not just approved — merged |
| CI pipeline is green on the target branch | No warnings promoted to errors |
| No TODO, FIXME, or console.log remains | Unless linked to a new ticket |
| No real-money, payment, or gambling logic exists | Verified by Review Worker |
| First post-deploy health check passes | Agent monitors for 15 minutes after merge |

If any criterion is unmet, the ticket is **not Done**. The agent reopens it or files a follow-up ticket.

---

## 3. Sprint Workflow

### 3.1 Sprint Length
2 calendar weeks, Monday to Monday.

### 3.2 Sprint Events

| Event | When | Who | Output |
|-------|------|-----|--------|
| **Sprint Planning** | Day 1, 1 hour | Product + Tech Lead + Agent Ops | Sprint backlog of Ready tickets |
| **Daily Sync** | Every morning, async | All agents post status to ticket | Comment on each active ticket with progress + blockers |
| **Mid-Sprint Review** | Day 5 | Tech Lead checks branch health | List of branches at risk of exceeding 3 days |
| **Sprint Review** | Last day, 1 hour | Product + Tech Lead | Demo of Done work, update to stakeholders |
| **Retrospective** | Last day, 30 min | Entire team (agents submit written input) | Action items for next sprint |

### 3.3 Agent Daily Workflow
```
1. Check board for Ready tickets matching your role.
2. Pick highest-priority ticket.
3. Create branch from develop.
4. Implement, test, document.
5. Open PR and assign to Review Worker.
6. Address review feedback.
7. After merge, verify build and deploy.
8. Update ticket status to Done.
9. Pick next ticket.
```

### 3.4 During Sprint
- No scope changes without Tech Lead approval.
- If a ticket proves larger than estimated, the agent stops, comments on the ticket, and awaits re-estimation.
- If a blocker is identified (e.g., needs another team's API), the agent escalates in the ticket immediately.

---

## 4. Release Workflow

### 4.1 Release Cadence
- **MVP phase**: Feature-based releases on sprint boundaries.
- **Post-MVP**: Weekly releases every Thursday.

### 4.2 Release Steps

| Step | Agent | Action |
|------|-------|--------|
| 1 | Feature Workers | All feature/fix branches merged to `develop` |
| 2 | Tech Lead | Create `release/vX.Y.Z` from `develop` |
| 3 | QA Worker | Run full regression suite on release branch |
| 4 | QA Worker | If bugs found, file fix tickets and append to release |
| 5 | Tech Lead | Bump version, update changelog |
| 6 | Review Worker | Final review of release branch |
| 7 | Tech Lead | Merge release to `main`, tag with version |
| 8 | CI/CD | Deploy `main` to production |
| 9 | All Agents | Monitor for 1 hour post-deploy |
| 10 | Tech Lead | Mark release as complete |

### 4.3 Rollback
If the error rate increases by >5% or P95 latency doubles, the Tech Lead initiates an automated rollback.
Agents do not decide rollbacks — they surface the data and alert.

---

## 5. Incident Workflow

### 5.1 Incident Severity

| Severity | Definition | Response Time | Fix Target |
|----------|------------|--------------|------------|
| P0 | Production down or data loss | Immediate | < 1 hour |
| P1 | Major feature broken, no workaround | 15 minutes | < 4 hours |
| P2 | Minor feature broken, workaround exists | 2 hours | < 24 hours |
| P3 | Cosmetic issue, no user impact | Next sprint | Next sprint |

### 5.2 Incident Response

```
1. DETECT   ← Alert or user report
2. TRIAGE   ← Determine severity, assign agent
3. RESPOND  ← Hotfix branch from main
4. FIX      ← Implement and test
5. DEPLOY   ← Merge, deploy, monitor
6. REVIEW   ← Post-mortem ticket within 24 hours
```

### 5.3 Agent Rules During Incidents
- P0/P1 interrupts all sprint work. The available agent with the relevant role drops everything and responds.
- The responding agent creates a hotfix branch from `main` (not `develop`).
- The fix must have a test that reproduces the issue before the fix is applied.
- After the hotfix is merged to `main`, the agent immediately opens a parallel PR to `develop` with the same fix.
- A post-mortem ticket is created within 24 hours. It must include: root cause, fix summary, detection gap (if any), and prevention measures.
- Incidents are not considered resolved until the post-mortem is written.
