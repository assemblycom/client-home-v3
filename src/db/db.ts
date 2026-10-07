import 'server-only'

declare global {
  var _drizzleDb: DB | undefined
}

import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import env from '@/config/env'
import { schema } from '@/db/schema'

export type DB = PostgresJsDatabase<typeof schema>

globalThis._drizzleDb ??= drizzle(
  postgres(env.DATABASE_URL, {
    prepare: false,
    // Serverless runs many concurrent function instances; capping connections
    // per instance keeps them from exhausting the Supabase pooler and causing
    // transient `econnrefused` failures. Requires the transaction-mode pooler URL.
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
  }),
  {
    casing: 'snake_case',
    schema,
  },
) as unknown as DB

const db = globalThis._drizzleDb as DB

export default db
