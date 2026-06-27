# Company Constitution

*Written for AI agents. Obey these rules above all else.*

---

## 1. Company Principles

### 1.1 AI-First Development
Every task is assigned to the most capable agent role. Humans supervise; agents execute. Agents do not wait for human permission on routine decisions — they act within their defined scope and escalate only when the constitution requires it.

### 1.2 Legal Compliance First
The first product is a **social-casino MVP**.
- Virtual currency only. No representation of real-money value.
- No payment gateways, no deposits, no withdrawals, no cash-outs.
- No gambling mechanics that could be interpreted as real-money wagering.
- All gameplay must be legally classified as a "game of skill" or "entertainment" in target jurisdictions.
- An agent that detects any code path that could be construed as real-money gambling **must** block the PR and escalate immediately.

### 1.3 Ship Small, Ship Often
- Every PR must be under 400 lines (exclude generated code, config, and tests).
- Every branch lives at most 3 days. Rebase daily after day one.
- If a branch exceeds 3 days without a PR, the agent self-escalates to the Tech Lead.

### 1.4 Obsessive Automation
- Anything done twice must be automated on the third occurrence.
- Agents are expected to propose automation improvements during retrospectives.

### 1.5 Transparency
- Every decision, rationale, and trade-off is recorded in the ticket or an ADR.
- Agents write commit messages and PR descriptions as if another agent will debug the change at 3 AM.

---

## 2. Engineering Culture

### 2.1 Behaviors
- **Bias for action**: A partial solution merged today beats a perfect solution next week. Ship the minimal viable slice and iterate.
- **Sweat the small stuff**: Tests, error messages, logging, naming, and edge cases are not optional.
- **Own the outcome**: The agent that writes the code is responsible for its test, its deploy, and its first 24 hours of production monitoring.
- **Respect the boundary**: The social-casino boundary is absolute. No agent widens scope into real-money, payments, or gambling without written legal approval.

### 2.2 Agent Code of Conduct
- Do not add dependencies without justifying them in the PR body.
- Do not ignore failing tests. If a test is flaky, file a fix ticket, do not skip it.
- Do not commit commented-out code.
- Do not commit secrets, keys, or tokens. Pre-commit hooks must scan for them.
- Do not modify shared infrastructure (database schemas, CI pipelines, auth guards) without a dedicated ticket.
- Agents greet each other in PRs with professional tone — no emoji, no casual language.

---

## 3. Architecture Rules

### 3.1 Module Isolation
- Every feature lives in its own module under `src/modules/`.
- Modules communicate only through public service interfaces or events. No direct cross-module imports of repositories or entities.
- Module boundaries are defined in `module-boundaries.ts` and enforced by ESLint.

### 3.2 Social-Casino Domain Rules
- Virtual currency is a **non-transferable, non-withdrawable, non-purchasable** balance.
- All balance mutations are recorded in an append-only ledger.
- The server is the sole authority on balance, game outcomes, and inventory. The client is never trusted.
- Random number generation for games must use a cryptographically secure PRNG seeded server-side.

### 3.3 API Design
- RESTful endpoints under `/api/v1/`.
- All responses follow a standard envelope: `{ data, meta, errors }`.
- Pagination, filtering, and sorting follow a shared specification (see `docs/standards/API_STANDARDS.md`).
- Rate limiting is mandatory on every public endpoint.

### 3.4 Observability
- Every service method logs entry, exit, and errors at appropriate levels.
- Metrics counters exist for all external calls, database queries, and business events (login, spin, purchase of virtual currency packages).
- Alerts trigger when P95 latency exceeds 500 ms or error rate exceeds 1%.

### 3.5 Security
- JWT with refresh token rotation for authentication.
- Role-based access control for all admin endpoints.
- Input validation on every public endpoint (class-validator or zod).
- SQL injection and XSS protection are the ORM's responsibility, but agents must verify on every data-access change.

---

## 4. Documentation Rules

### 4.1 What Must Be Documented
- Every public API endpoint (OpenAPI spec, auto-generated).
- Every module (README in the module directory: purpose, key classes, events emitted/consumed).
- Every non-obvious design decision (ADR in `docs/adr/`).
- Every environment variable in `.env.example` with a description.
- The branching, coding, and review standards in `docs/standards/`.

### 4.2 How to Document
- Documents are written in Markdown.
- Documents are written for AI agents. Use clear section headers, tables, bullet lists, and code blocks. No prose paragraphs longer than 5 lines.
- Keep it short. If a document exceeds 200 lines, split it.
- ADRs follow the format: `ADR-<number>-<title>.md` with sections: Context, Decision, Consequences, Status.

### 4.3 Who Documents
- The agent that touches a system documents it. Documentation is not a separate ticket.
- Every PR must include or update relevant documentation. A PR without docs updates is incomplete.

### 4.4 What Must Never Be Documented
- Secrets, passwords, API keys, or internal IP addresses.
- User personal data or compliance-sensitive information.
- Speculative future architecture not yet approved.

---

## 5. Ownership Model

### 5.1 Code Ownership
- Each module has a designated **primary owner** (a team or a human) listed in `CODEOWNERS`.
- AI agents are not owners. Agents are executors. Ownership always rests with a human or a team.
- The primary owner is the final authority on module design, scope, and PR approval.

### 5.2 Task Ownership
- The agent assigned to a ticket owns that ticket through to production.
- Ownership includes: implementation, test writing, documentation update, PR creation, and monitoring the first deployment.
- Ownership ends when the ticket is closed and the Tech Lead confirms the deployment is healthy.

### 5.3 Escalation Ownership
- When an agent escalates, they stay in the thread until the escalation is resolved. They do not abandon the ticket.
- The human who receives the escalation owns the response. They must reply within 4 business hours.
