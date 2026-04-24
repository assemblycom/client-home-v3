/**
 * Test database helper using PGlite (in-process PostgreSQL via WASM).
 *
 * Uses `generateDrizzleJson` + `generateMigration` from drizzle-kit to create
 * tables directly from the existing Drizzle pgTable definitions — no duplicated SQL.
 * We use this approach instead of `pushSchema` to correctly handle `casing: 'snake_case'`.
 */

// drizzle-kit/api is CJS-only — use createRequire for proper ESM compatibility
import { createRequire } from 'node:module'
import { PGlite } from '@electric-sql/pglite'
import { media, mediaTypeEnum } from '@media/lib/media.schema'
import { conditions } from '@segments/lib/conditions/conditions.schema'
import { customFieldEntityTypeEnum, segmentConfigs } from '@segments/lib/segment-config/segment-config.schema'
import { segments } from '@segments/lib/segments/segments.schema'
import { settings } from '@settings/lib/settings/settings.schema'
import { drizzle } from 'drizzle-orm/pglite'
import { schema } from '@/db/schema'

const _require = createRequire(import.meta.url)
// biome-ignore lint/suspicious/noExplicitAny: drizzle-kit/api has no ESM export
const { generateDrizzleJson, generateMigration } = _require('drizzle-kit/api') as any

export const TEST_WORKSPACE_ID = 'ws-test-001'

export type TestDB = ReturnType<typeof drizzle<typeof schema>>

const tableSchemas = { media, mediaTypeEnum, segments, conditions, settings, segmentConfigs, customFieldEntityTypeEnum }

export const createTestDb = async (): Promise<{ db: TestDB; client: PGlite }> => {
  const client = new PGlite()
  const db = drizzle(client, { casing: 'snake_case', schema })

  const emptyJson = generateDrizzleJson({})
  const currentJson = generateDrizzleJson(tableSchemas, emptyJson.id, undefined, 'snake_case')
  const statements: string[] = await generateMigration(emptyJson, currentJson)

  for (const statement of statements) {
    await client.exec(statement)
  }

  return { db, client }
}
