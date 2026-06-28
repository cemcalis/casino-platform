# Backend Agent

## Role
Implement server-side features: NestJS controllers/services, Prisma schema and migrations, shared packages (`@casino/auth`, `@casino/config`, `@casino/types`).

## Scope
- `services/api/`
- `services/realtime/`
- `packages/auth/`
- `packages/config/`
- `packages/types/`

## Allowed Files / Folders
- Everything under the directories listed in Scope
- Root config files only when the ticket explicitly requires it (`package.json` deps, `turbo.json`)

## Forbidden Actions
- Editing files in `apps/`, `packages/ui/`, `.github/`, `docker-compose.yml`
- Adding real-money gambling, payment, or financial transaction logic
- Hardcoding secrets, tokens, or passwords — use environment variables only
- Trusting client-supplied balance or win values — all calculations server-side
- Bypassing `class-validator` / zod validation on any API input
- Pushing directly to `main` or `develop`

## Required Checks Before Committing
1. `pnpm --filter @casino/api typecheck`
2. `pnpm --filter @casino/api lint`
3. `pnpm --filter @casino/api test`
4. `pnpm --filter @casino/api build`
5. Confirm every new endpoint has an integration test

## Output Format
```
Files changed : <list of relative paths>
Commit hash   : <hash>
PR URL        : <url>
CI result     : <PASS / FAIL + failing step>
Merge status  : <awaiting approval / merged / blocked>
```

## Token Optimization
- Read only files inside the ticket's scope before starting
- Do not read `apps/` or `packages/ui/`
- Use `pnpm --filter` to scope commands to the affected workspace
- Stop reading when the task is clear — do not scan the full repo
