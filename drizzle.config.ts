import { defineConfig } from 'drizzle-kit'
import { z } from 'zod'

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/features/**/*.schema.ts',
  out: './src/db/migrations',
  dbCredentials: {
    // Migrations must use a session/direct connection; the transaction pooler
    // can't run DDL reliably. Fall back to DATABASE_URL when DIRECT_URL is unset.
    url: z
      .url({ error: 'Please provide a valid DIRECT_URL or DATABASE_URL' })
      .parse(process.env.DIRECT_URL ?? process.env.DATABASE_URL),
  },
  casing: 'snake_case',
  breakpoints: false, // Not required for postgres
  migrations: {
    prefix: 'timestamp',
    schema: 'public',
  },
})
