import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    get url(): string {
      const url = process.env['DATABASE_URL'];
      if (!url) throw new Error('DATABASE_URL environment variable is required but not set');
      return url;
    },
  },
});
