# Organization

## Mission
Build an AI-first Software Company OS, starting with a legal social-casino MVP (virtual currency only, no real-money gambling, no payment integration).

## Teams

| Team | Responsibility |
|------|---------------|
| Platform | CI/CD, infrastructure, deployment, monitoring |
| Backend | API, game logic engine, user accounts, leaderboards |
| Frontend | Web client (React/Next.js), admin dashboard |
| QA | Test automation, manual regression, bug triage |
| Product | Specifications, ticket prioritization, stakeholder sync |
| Security | Code review, dependency scanning, penetration testing |
| AI Agents | Automated development tasks under human supervision |

## Agent Operations
- AI agents create branches, write code, run tests, and open PRs.
- Every PR must be reviewed by at least one human or a designated senior agent.
- Agents are assigned tickets via the project board. Each ticket has a clear acceptance criteria and a defined scope boundary.
- Agents escalate to humans on ambiguous requirements, security decisions, or production incidents.

## Release Cadence
- Social-casino MVP: feature-based releases on a 2-week sprint cycle.
- After MVP: continuous delivery with weekly releases.
- Hotfixes bypass the sprint cycle but require a post-mortem ticket.

## Communication
- All technical decisions must be documented in tickets or ADRs (Architecture Decision Records).
- Daily standup: async check-in via bot in Slack.
- Retrospective: end of every sprint.
