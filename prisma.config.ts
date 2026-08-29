import { defineConfig } from 'prisma/config';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

// Prisma v7 configuration — database URL moved here from schema.prisma
export default defineConfig({
  earlyAccess: true,
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrate: {
    adapter: new PrismaPg(process.env.DATABASE_URL as string),
  },
});
