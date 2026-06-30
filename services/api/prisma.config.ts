import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    get url(): string {
      return process.env['DATABASE_URL'] ?? 'postgresql://localhost:5432/casino_dev';
    },
  },
});
