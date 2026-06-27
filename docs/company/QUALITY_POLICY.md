# Quality Policy

*Written for AI agents. This defines the minimum quality bar and the review process.*

---

## 1. Quality Principles

1. **No regression is acceptable.** Every change must prove it does not break existing behavior.
2. **Tests are not optional.** Untested code is considered not written.
3. **Quality is the creator's responsibility.** The Review Worker catches gaps; they do not fix them.
4. **The social-casino boundary is a quality gate.** Any PR that crosses it is rejected, not just flagged.
5. **Metrics drive improvements.** Quality decisions are based on data, not opinion.

---

## 2. Review Policy

### 2.1 What Requires Review
All code changes require review. No exceptions.
- Feature code, test code, configuration, CI/CD changes, documentation, and database migrations all require at least one approving review.
- The only exception is a P0 hotfix where the Tech Lead can self-approve, but a post-hoc review must occur within 24 hours.

### 2.2 Reviewer Assignments

| Change Type | Required Reviewer |
|-------------|------------------|
| Feature code (new module) | Review Worker + Tech Lead |
| Feature code (existing module) | Review Worker |
| Bug fix | Review Worker |
| Hotfix | Tech Lead (immediate) + Review Worker (post-hoc) |
| Documentation | Review Worker or Documentation Worker |
| CI/CD / Infrastructure | Tech Lead |
| Database migration | Tech Lead + Review Worker |
| Dependency addition | Tech Lead |
| Configuration only | Review Worker |

### 2.3 Reviewer Responsibilities
The Review Worker must verify every item on the PR Review Checklist (see CODING_STANDARDS.md) plus:

- [ ] Does the code match the acceptance criteria?
- [ ] Are error states handled and logged?
- [ ] Are there any security vulnerabilities (XSS, injection, broken auth)?
- [ ] Are there any compliance risks (real-money, gambling, payment)?
- [ ] Are tests meaningful (assert correct behavior, not just coverage numbers)?
- [ ] Is the PR under 400 lines (exclude generated code)?
- [ ] Is documentation updated or a documentation ticket created?
- [ ] Is there any TODO or FIXME without a linked ticket?
- [ ] Is the commit history clean? (No merge commits, no "WIP" commits.)

### 2.4 Review Response Times

| Priority | First Response Target | Merge Target |
|----------|----------------------|--------------|
| P0/P1 hotfix | Within 30 minutes | Within 1 hour |
| Feature PR | Within 4 business hours | Within 1 business day |
| Bug fix PR | Within 2 business hours | Within 4 business hours |
| Documentation PR | Within 1 business day | Within 1 business day |

### 2.5 What Happens When a Review Fails

| Failure | Action |
|---------|--------|
| Test failure | Reviewer rejects. Author fixes and re-requests. |
| Lint/type error | Reviewer rejects. Author fixes and re-requests. |
| Missing test coverage (<80%) | Reviewer rejects. Author adds tests. |
| Compliance risk detected | Reviewer blocks and escalates to `@security` and `@legal`. PR is frozen. |
| Architecture violation | Reviewer rejects and tags Tech Lead. Author awaits guidance. |
| PR size >400 lines | Reviewer rejects. Author splits into multiple PRs. |
| Minor style/readability issue | Reviewer comments as suggestion. Author fixes or explains. Does not block merge. |

### 2.6 Review Automation
- CI automatically rejects PRs that fail lint, typecheck, or tests.
- CI computes diff coverage and rejects if below 80%.
- CI scans for secrets, tokens, and keys. If found, the PR is blocked and `@security` is notified.
- CI checks PR size and adds a label: `size/L`, `size/XL`, etc. If `size/XL` (>400 lines), CI adds a warning label but the reviewer makes the final call.

---

## 3. Testing Standards

### 3.1 Test Types and Requirements

| Test Type | Required For | Min Coverage | Framework |
|-----------|-------------|--------------|-----------|
| Unit | All services, utilities, guards, helpers | 80% line coverage on changed code | Vitest |
| Integration | All API endpoints, all database operations | Happy path + 2 error cases per endpoint | Vitest + Supertest |
| E2E | All user-facing features, critical user journeys | 1 spec per journey | Playwright |
| Snapshot | UI components (optional, reviewer discretion) | Changed components | Storybook test runner |

### 3.2 Test Quality Rules
- Tests must be deterministic. No sleeps, no timeouts, no dependencies on external services (mock them).
- Each test must be readable as a specification. Test name format: `should <expected behavior> when <condition>`.
- Tests must clean up after themselves. Database state is reset between test suites.
- Integration tests use a test database, not production or shared environments.
- E2E tests run against a dedicated staging environment.

### 3.3 What Cannot Be Tested
- Randomness: Test that game outcomes are in the valid range, not specific values.
- External services: Test the integration point (mock), not the external service itself.

---

## 4. Quality Gates

Every promotion between environments requires passing quality gates:

### 4.1 Development → Integration (PR Merge to develop)
- [ ] CI green (lint, typecheck, test, build)
- [ ] At least one approving review
- [ ] No compliance flags
- [ ] PR size under 400 lines

### 4.2 Integration → Staging (Release Branch)
- [ ] Full regression suite passes
- [ ] Coverage report reviewed (no reduction below 80% overall)
- [ ] Changelog updated
- [ ] Version bumped

### 4.3 Staging → Production (Merge to main)
- [ ] QA Worker signs off
- [ ] Tech Lead approves
- [ ] No known P0/P1 bugs open against the release
- [ ] Rollback plan exists

---

## 5. Technical Debt Policy

### 5.1 Debt Tolerance
- New features must not introduce technical debt. If a workaround is necessary, a debt ticket must be filed in the same sprint.
- Existing debt may be refactored when the touched code exceeds 30% churn in a single PR.

### 5.2 Debt Tracking
- Debt is tracked as tickets with the `tech-debt` label.
- Each sprint allocates 20% of capacity to debt reduction.
- Agents are expected to identify and file debt tickets during implementation.

### 5.3 Debt Review
The Tech Lead reviews the debt backlog every sprint. Debt older than 3 sprints is escalated to Product for prioritization.

---

## 6. Compliance Gate

### 6.1 Social-Casino Compliance Checklist
Every PR must pass this checklist before merge:

- [ ] No reference to real-money currency (USD, EUR, etc.) in business logic
- [ ] No payment provider integration (Stripe, PayPal, etc.)
- [ ] No withdrawal or cash-out mechanisms
- [ ] No transfer of virtual currency between users
- [ ] No purchase of virtual currency with real money (MVP phase)
- [ ] All gameplay outcomes are determined server-side
- [ ] Terms of Service explicitly state "no real-money value"
- [ ] Age gate verification is present at registration

### 6.2 Compliance Violation Response
If a PR fails the compliance gate:
1. The reviewer immediately blocks the PR.
2. The reviewer escalates to `@security` and `@legal`.
3. The PR is frozen. No further changes until cleared.
4. The violating agent receives a written notice and must re-read the Compliance section of this document.
