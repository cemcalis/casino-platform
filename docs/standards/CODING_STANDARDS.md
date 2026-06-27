# Coding Standards

## Language & Framework
- TypeScript for backend (Node.js/NestJS) and frontend (React/Next.js).
- Strict mode enabled in `tsconfig.json`.
- Prettier + ESLint with the shared config at `tools/eslint-config`.
- Pre-commit hooks enforce linting and formatting.

## Naming Conventions

| Concept | Convention | Example |
|---------|-----------|---------|
| Variables / functions | camelCase | `getUserBalance()` |
| Classes / interfaces | PascalCase | `UserRepository` |
| Interfaces | PascalCase, no `I` prefix | `UserData` not `IUserData` |
| Types / enums | PascalCase | `CurrencyType` |
| Files | kebab-case | `user-service.ts` |
| Directories | kebab-case | `user-profile/` |
| React components | PascalCase file | `UserProfile.tsx` |
| Database tables | snake_case | `user_sessions` |
| Environment variables | UPPER_SNAKE_CASE | `DATABASE_URL` |

## Project Structure
```
src/
  modules/       # Feature modules (user, game, wallet, etc.)
  common/        # Shared utilities, guards, interceptors
  config/        # Environment config schemas
  database/      # Migrations, seeds, entities
test/
  unit/          # Unit tests mirror src/ structure
  integration/   # Cross-module integration tests
  e2e/           # Full-stack end-to-end tests
```

## Testing Standards
- **Unit tests** required for all services, utilities, and guards. Minimum 80% line coverage.
- **Integration tests** required for every API endpoint and database interaction.
- **E2E tests** required for critical user journeys (registration, login, gameplay loop, purchase flow).
- Test files live next to the source with a `.spec.ts` suffix.
- Use `vitest` for unit/integration, `Playwright` for E2E.

## Code Review Checklist
- [ ] No hardcoded secrets, URLs, or magic numbers.
- [ ] Error paths are handled and logged.
- [ ] New dependencies are justified and vetted for license + security.
- [ ] Database queries are indexed and paginated where applicable.
- [ ] No TODO or FIXME without a linked ticket.
- [ ] Observability: relevant metrics and structured logging added.
- [ ] No real-money or gambling logic present (social-casino only).

## Security Constraints
- All user input must be validated (class-validator / zod).
- Authentication via JWT with refresh token rotation.
- No client-side trust for balance, win calculations, or inventory.
- Virtual currency limits must be enforced server-side.
- Rate limiting on all public endpoints.
