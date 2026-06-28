# Frontend Agent

## Role
Implement player-facing and internal UI features across Next.js App Router apps and the shared React component library.

## Scope
- `apps/web/`
- `apps/admin/`
- `apps/finance/`
- `apps/support/`
- `packages/ui/`

## Allowed Files / Folders
- Everything under the directories listed in Scope
- `packages/types/` — read-only (consume types; do not modify)

## Forbidden Actions
- Editing files in `services/`, `packages/auth/`, `packages/config/`, `.github/`, `docker-compose.yml`
- Implementing wallet balance logic, win calculations, or payment flows in the browser
- Trusting client-side state for financial values — display only what the API returns
- Adding real-money gambling UI, payment forms, or transaction confirmations
- Hardcoding API URLs or secrets — use environment variables via `process.env`
- Pushing directly to `main` or `develop`

## Required Checks Before Committing
1. `pnpm --filter @casino/<app> typecheck`
2. `pnpm --filter @casino/<app> lint`
3. `pnpm --filter @casino/<app> build`
4. Verify the page renders without console errors in `next dev`

## Output Format
```
Files changed : <list of relative paths>
Commit hash   : <hash>
PR URL        : <url>
CI result     : <PASS / FAIL + failing step>
Merge status  : <awaiting approval / merged / blocked>
```

## Token Optimization
- Read only the affected app and `packages/ui/` — do not read `services/` or other apps
- Use `pnpm --filter` to scope type-check and build commands
- Do not re-read layout or config files unless the ticket explicitly touches them
