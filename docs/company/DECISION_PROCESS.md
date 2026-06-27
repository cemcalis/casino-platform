# Decision Process

*Written for AI agents. This defines how decisions are made, escalated, and communicated.*

---

## 1. Decision Tiers

| Tier | Scope | Who Decides | Time Limit |
|------|-------|-------------|------------|
| **T1 — Agent** | Implementation details within a defined ticket: variable naming, test structure, helper extraction, file organization | The assigned agent | Immediate |
| **T2 — Agent + Review** | Design choices that affect a module but not others: new service method, new endpoint shape, error code strategy | Agent proposes, Review Worker approves/rejects | Within PR cycle |
| **T3 — Tech Lead** | Cross-module impact: new module creation, database schema changes, dependency additions, architecture pattern changes | Tech Lead | Within 1 business day |
| **T4 — Team** | Product scope, sprint priorities, technology stack changes | Product + Tech Lead together | Within 1 sprint |
| **T5 — Legal/Compliance** | Anything touching real-money, gambling regulation, user data privacy, or jurisdiction boundaries | External legal counsel | As needed |

### 1.1 Decision Escalation Rules
- An agent must not guess on a T3+ decision. If uncertain, escalate.
- An agent making a T1/T2 decision must document the rationale in the PR description.
- Any decision that is reversed later must be documented with the new rationale.

---

## 2. Escalation Policy

### 2.1 When to Escalate
An agent **must** escalate immediately when any of these occur:

| Condition | Example |
|-----------|---------|
| Ambiguous requirement | Acceptance criteria has a gap or contradiction |
| Security concern | A design could leak data or allow abuse |
| Compliance risk | Any code path resembles real-money gambling or payment |
| Scope creep | The implementation needs to touch systems outside the ticket boundary |
| Dependency deadlock | Blocked by another team or external service with no ETA |
| Estimated overflow | Ticket is taking >2x the estimated time |
| Architecture violation | The cleanest solution violates an existing architecture rule |
| Tool/CI failure | The agent cannot unblock itself (e.g., pipeline broken) |

### 2.2 How to Escalate
1. Comment on the ticket with a clear section:
   - **Escalation reason**
   - **Attempted solutions**
   - **Specific question or decision needed**
2. Tag the appropriate role: `@tech-lead`, `@product`, `@security`.
3. The agent stays in the thread and continues working on unblocked portions of the ticket.

### 2.3 Response Expectations

| Role Tagged | Response Target |
|-------------|-----------------|
| `@tech-lead` | Within 4 business hours |
| `@product` | Within 1 business day |
| `@security` | Within 2 business hours (P0/P1) or 1 business day |
| `@legal` | Within 2 business days |

If the response target is missed, the agent re-tags and escalates to the next tier.

### 2.4 Emergency Escalation
For P0 incidents or imminent compliance violations, the agent escalates simultaneously to `@tech-lead` and `@security` via the alert channel (PagerDuty / Slack). Do not wait for a response target.

---

## 3. AI Communication Rules

### 3.1 Inter-Agent Communication
- All agent-to-agent communication happens **in the ticket** or **in the PR**.
- No private messages between agents. Every decision must be auditable.
- Format: clear, concise, labeled sections. No conversational filler.

### 3.2 Agent Writing Style
```
Good:
  "The /balance endpoint currently queries the database on every call.
  Caching would reduce P99 latency from 120ms to ~5ms.
  Proposed: add Redis cache with 60s TTL.
  Trade-off: stale balances for up to 60s (acceptable per spec).
  Requesting: approval to add Redis to the module."

Bad:
  "I noticed the balance endpoint is kinda slow, so I was thinking
  maybe we could add some caching? What do you all think?"
```

### 3.3 PR Communication
- The PR title and description use the agent's identity format (see AGENT_ROLES.md).
- Review comments are factual and reference specific lines: "Line 42: This query is missing an index on user_id."
- When addressing review feedback, the agent replies with what changed: "Fixed. Added index on user_id and verified with EXPLAIN ANALYZE."
- Agents do not argue in reviews. If they disagree with a review comment, they escalate to Tech Lead.

### 3.4 Notifications
- Agents post a daily status comment on active tickets by 09:00.
- The status format is:
  ```
  **Agent**: Feature Worker
  **Status**: In Progress
  **Progress**: Implementation complete, writing tests (3/5 done)
  **Blockers**: None
  **ETA**: Tomorrow EOD
  ```

### 3.5 Tone
- Professional and direct. No emoji, no casual language, no markdown decoration beyond what is needed for structure.
- Assume the reader is another agent or a busy human. Get to the point in the first sentence.
- Do not apologize. Do not hedge. State facts and decisions.

---

## 4. Architecture Decision Records

### 4.1 When to Write an ADR
Any T3+ decision must be recorded as an ADR in `docs/adr/`.

Also write an ADR when:
- Adopting a new library or framework.
- Changing a module boundary.
- Choosing a database, cache, or queue technology.
- Defining an API versioning strategy.
- Any decision that will be referenced in future discussions.

### 4.2 ADR Format
```
# ADR-<number>: <Title>

**Status**: Proposed | Accepted | Deprecated | Superseded

**Context**:
Why is this decision needed? What are the constraints?

**Decision**:
What is the decision and what alternatives were considered?

**Consequences**:
What becomes easier and what becomes harder?

**Compliance Check**:
How will agents verify this decision is followed?
```

### 4.3 ADR Lifecycle
1. **Draft**: Written by the proposing agent, attached to the ticket.
2. **Review**: Reviewed by Tech Lead and any affected module owners.
3. **Accepted**: Merged to `develop` with status Accepted.
4. **Superseded**: If a newer ADR replaces it, update status and link to the new ADR.
