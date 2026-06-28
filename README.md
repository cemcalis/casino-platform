# Casino Platform

Social casino platform — no real-money gambling, no payment integration.

## Prerequisites

- Node.js ≥ 18
- pnpm ≥ 9
- Docker Desktop

## Setup

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
```

## Local Infrastructure

Start PostgreSQL and Redis:

```bash
docker compose up -d
```

Stop services:

```bash
docker compose down
```

Stop and remove volumes (full reset):

```bash
docker compose down -v
```

Check service health:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs -f postgres
docker compose logs -f redis
```

## Development

```bash
# Run all apps and services in watch mode
pnpm dev

# Type-check all packages
pnpm typecheck

# Lint all packages
pnpm lint

# Build all packages
pnpm build

# Run all tests
pnpm test
```

## Apps

| App | URL | Description |
|-----|-----|-------------|
| `@casino/web` | http://localhost:3000 | Player-facing client |
| `@casino/admin` | http://localhost:3001 | Admin panel |
| `@casino/finance` | http://localhost:3002 | Finance operations |
| `@casino/support` | http://localhost:3003 | Support tooling |
| `@casino/api` | http://localhost:4000/api/v1/health | REST API |
