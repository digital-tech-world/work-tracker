import type { Config } from 'drizzle-kit';

export default {
  schema: './tool/server/db/schema.ts',
  out: './tool/server/drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: 'file:./data/work-tracker.db',
  },
} satisfies Config;