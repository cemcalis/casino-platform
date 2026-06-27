TICKET-001: Create project scaffold

Goal:
Create the initial monorepo scaffold.

Stack:
- pnpm workspace
- Next.js TypeScript app for player web
- Next.js TypeScript app for admin panel
- NestJS TypeScript API
- shared packages/types
- shared packages/ui
- Docker compose for PostgreSQL and Redis

Rules:
- Do not implement casino logic.
- Do not implement real-money gambling.
- Do not add payment integration.
- Do not add games yet.
- Only create clean structure.
- Add README.
- Add package scripts.
- Add basic .gitignore.

Deliverable:
- Working folder structure
- pnpm workspace
- apps/web
- apps/admin
- services/api
- packages/types
- packages/ui
- docker-compose.yml
- README instructions
