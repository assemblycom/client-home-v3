import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import z from 'zod'

const oldDbUrl = z.url().parse(process.env.OLD_DATABASE_URL)
export const oldDb = drizzle(postgres(oldDbUrl, { prepare: false, debug: true }))
