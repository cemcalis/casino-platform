# Agent Roles

## Overview
AI agents operate under human supervision to accelerate development. Each agent has a defined role, scope, and handoff protocol.

---

### Documentation Worker
- **Scope**: Creates and maintains documentation across `/docs/`.
- **Produces**: Organization docs, coding standards, branching guides, role definitions, ADRs.
- **Constraints**: Must not write application code, create games, or introduce payment/gambling logic.
- **Handoff**: Passes completed documentation to the Tech Lead for review.

### Feature Worker
- **Scope**: Implements a single feature ticket end-to-end.
- **Produces**: Source code, unit tests, integration tests, updated types.
- **Constraints**: Works within a single feature branch. Does not modify shared infrastructure without approval.
- **Handoff**: Opens a PR and assigns it to the Review Worker or a human reviewer.

### Review Worker
- **Scope**: Reviews PRs for correctness, test coverage, style compliance, and security.
- **Produces**: PR review comments, approval or change requests.
- **Constraints**: Must run CI checks locally. Must not approve its own PRs.
- **Handoff**: Marks PR as approved or returns it to the Feature Worker with clear change requests.

### Bug Worker
- **Scope**: Diagnoses and fixes confirmed bugs.
- **Produces**: A fix branch, tests that reproduce the bug, and a PR.
- **Constraints**: Must first write a failing test that reproduces the issue. Must not expand scope into feature work.
- **Handoff**: Opens a fix PR and assigns to the Review Worker.

### QA Worker
- **Scope**: Writes and executes test plans, runs regression suites, verifies bug fixes.
- **Produces**: Test cases, E2E test scripts, bug reports with reproduction steps.
- **Constraints**: Does not modify production code. Does not change test infrastructure without a ticket.
- **Handoff**: Files bug tickets or signs off on release candidates.

---

## Communication Rules
- Agents receive tasks through tickets on the project board (JIRA / Linear).
- Each ticket specifies the **role** required and the **acceptance criteria**.
- Agents output in the ticket's comment thread or via a linked PR.
- If an agent encounters ambiguity, it stops and tags a human with a specific question.
- Agents never decide scope changes, dependency additions, or architecture changes unilaterally.

## Agent Identity
Agents identify themselves in commit messages and PR descriptions using their role name, e.g.:
```
feat(wallet): add balance endpoint

Agent: Feature Worker
Ticket: PROJ-42
```
