/**
 * Test database helper using PGlite (in-process PostgreSQL via WASM).
 *
 * Uses `generateDrizzleJson` + `generateMigration` from drizzle-kit to create
 * tables directly from the existing Drizzle pgTable definitions — no duplicated SQL.
 * We use this approach instead of `pushSchema` to correctly handle `casing: 'snake_case'`.
 *
 * Also provides `seedTestDb` to populate the database with realistic data via drizzle-seed.
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
import { seed } from 'drizzle-seed'
import { schema } from '@/db/schema'

const _require = createRequire(import.meta.url)
// biome-ignore lint/suspicious/noExplicitAny: drizzle-kit/api has no ESM export
const { generateDrizzleJson, generateMigration } = _require('drizzle-kit/api') as any

export const TEST_WORKSPACE_ID = 'ws-test-001'

export type TestDB = ReturnType<typeof drizzle<typeof schema>>

// All table + enum definitions — same pgTable/pgEnum objects used in production
const tableSchemas = { media, mediaTypeEnum, segments, conditions, settings, segmentConfigs, customFieldEntityTypeEnum }

/** Creates a fresh PGlite instance with all tables, returns a typed Drizzle DB */
export const createTestDb = async (): Promise<{ db: TestDB; client: PGlite }> => {
  const client = new PGlite()
  const db = drizzle(client, { casing: 'snake_case', schema })

  // Generate DDL by diffing empty schema vs current schema with snake_case casing
  const emptyJson = generateDrizzleJson({})
  const currentJson = generateDrizzleJson(tableSchemas, emptyJson.id, undefined, 'snake_case')
  const statements: string[] = await generateMigration(emptyJson, currentJson)

  for (const statement of statements) {
    await client.exec(statement)
  }

  return { db, client }
}

/**
 * Seeds segments and conditions with realistic data using drizzle-seed.
 *
 * - Foreign keys are auto-linked (conditions get valid segmentIds)
 * - Column names are auto-detected for realistic values (name → real names, etc.)
 * - Deterministic: same seed number = same data across runs
 */
export const seedSegments = async (db: TestDB, options: { segments?: number; conditions?: number } = {}) => {
  const { segments: segmentCount = 3, conditions: conditionCount = 6 } = options

  await seed(db, { segments, conditions }).refine((f) => ({
    segments: {
      count: segmentCount,
      columns: {
        workspaceId: f.default({ defaultValue: TEST_WORKSPACE_ID }),
        createdById: f.default({ defaultValue: 'a0000000-0000-0000-0000-000000000001' }),
        name: f.firstName(),
      },
    },
    conditions: {
      count: conditionCount,
      columns: {
        compareValue: f.lastName(),
      },
    },
  }))
}

/**
 * Seeds a segment config with realistic data using drizzle-seed.
 */
export const seedSegmentConfig = async (db: TestDB) => {
  await seed(db, { segmentConfigs }).refine((f) => ({
    segmentConfigs: {
      count: 1,
      columns: {
        workspaceId: f.default({ defaultValue: TEST_WORKSPACE_ID }),
        customField: f.default({ defaultValue: 'status' }),
        customFieldId: f.default({ defaultValue: 'cf-status-1' }),
      },
    },
  }))
}
