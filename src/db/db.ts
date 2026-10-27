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
    idle_timeout: 20,
    max_lifetime: 60 * 30,
    connect_timeout: 10,
  }),
  {
    casing: 'snake_case',
    schema,
  },
) as unknown as DB

const db = globalThis._drizzleDb as DB

export default db
