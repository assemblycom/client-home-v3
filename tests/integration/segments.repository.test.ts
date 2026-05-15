/**
 * Integration tests for segment repositories against PGlite (in-process Postgres).
 *
 * Uses drizzle-seed for bulk realistic data, and factory inserts where a test
 * needs control over specific field values.
 */
import { CustomFieldEntityType } from '@assembly/types'
import type { PGlite } from '@electric-sql/pglite'
import ConditionsDrizzleRepository from '@segments/lib/conditions/conditions.repository'
import SegmentConfigsDrizzleRepository from '@segments/lib/segment-config/segment-config.repository'
import SegmentsDrizzleRepository from '@segments/lib/segments/segments.repository'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { insertSegmentConfig, seedSegmentConfig, seedSegments } from '../seeders/segments'
import { createTestDb, TEST_WORKSPACE_ID, type TestDB } from '../setup/test-db'

vi.mock('server-only', () => ({}))
vi.mock('@/db', () => ({ default: {} }))

let db: TestDB
let client: PGlite
let segmentsRepo: SegmentsDrizzleRepository
let conditionsRepo: ConditionsDrizzleRepository
let configsRepo: SegmentConfigsDrizzleRepository

beforeAll(async () => {
  const testDb = await createTestDb()
  db = testDb.db
  client = testDb.client
  segmentsRepo = new SegmentsDrizzleRepository(db as never)
  conditionsRepo = new ConditionsDrizzleRepository(db as never)
  configsRepo = new SegmentConfigsDrizzleRepository(db as never)
})

afterAll(async () => {
  await client.close()
})

beforeEach(async () => {
  await client.exec('DELETE FROM "conditions"')
  await client.exec('DELETE FROM "settings"')
  await client.exec('DELETE FROM "segments"')
  await client.exec('DELETE FROM "segment_configs"')
})

describe('Deleting segments', () => {
  it('should delete all conditions associated with it', async () => {
    await seedSegments(db, { segments: 1, conditions: 3 })

    const [segment] = await segmentsRepo.getAll(TEST_WORKSPACE_ID)
    expect(segment.conditions.length).toBe(3)

    await segmentsRepo.delete(segment.id)

    const remaining = await conditionsRepo.getBySegmentId(segment.id)
    expect(remaining).toHaveLength(0)
  })

  it('should cascade-delete all conditions on bulk workspace delete', async () => {
    await seedSegments(db, { segments: 2, conditions: 9 })

    const allSegments = await segmentsRepo.getAll(TEST_WORKSPACE_ID)
    expect(allSegments.length).toBe(2)

    await segmentsRepo.deleteAllByWorkspaceId(TEST_WORKSPACE_ID)

    for (const seg of allSegments) {
      const remaining = await conditionsRepo.getBySegmentId(seg.id)
      expect(remaining).toHaveLength(0)
    }
  })
})

describe('Creating conditions', () => {
  // A condition row must be linked to an existing segment. The DB-level FK constraint
  // guarantees this regardless of what the service layer does.
  it('fails without an existing segmentId', async () => {
    await expect(
      conditionsRepo.createMany('a0000000-0000-0000-0000-000000000099', [{ compareValue: 'orphan' }]),
    ).rejects.toThrow()
  })
})

describe('Creating a segment config', () => {
  // The DB enforces a unique index on segment_configs.workspace_id so only one
  // config can ever exist per workspace at the storage layer.
  it('fails when another config already exists for the workspace', async () => {
    await seedSegmentConfig(db)

    await expect(
      configsRepo.create({
        workspaceId: TEST_WORKSPACE_ID,
        customField: 'tier',
        customFieldId: 'cf-2',
        entityType: CustomFieldEntityType.COMPANY,
      }),
    ).rejects.toThrow()
  })
})

describe('Upserting a segment config', () => {
  it('inserts when no config exists for the workspace', async () => {
    const config = await configsRepo.upsert({
      workspaceId: TEST_WORKSPACE_ID,
      customField: 'status',
      customFieldId: 'cf-1',
      entityType: CustomFieldEntityType.CLIENT,
    })
    expect(config.customField).toBe('status')
  })

  // Upsert is the only way the service writes configs; re-running with the same
  // customField (e.g. after a field is recreated and the API id changes) should
  // update in place rather than create a duplicate.
  it('updates the existing row instead of creating a duplicate', async () => {
    await insertSegmentConfig(db, { customField: 'status', customFieldId: 'cf-status-old' })

    await configsRepo.upsert({
      workspaceId: TEST_WORKSPACE_ID,
      customField: 'status',
      customFieldId: 'cf-status-new',
      entityType: CustomFieldEntityType.CLIENT,
    })

    const fetched = await configsRepo.getByWorkspaceId(TEST_WORKSPACE_ID)
    expect(fetched?.customFieldId).toBe('cf-status-new')
  })
})

describe('Loading a segment by id', () => {
  it('eagerly loads conditions via the relational query', async () => {
    await seedSegments(db, { segments: 1, conditions: 4 })

    const [segment] = await segmentsRepo.getAll(TEST_WORKSPACE_ID)
    const fetched = await segmentsRepo.getOne(segment.id)

    expect(fetched).toBeDefined()
    expect(fetched?.conditions).toHaveLength(4)
    for (const condition of fetched?.conditions ?? []) {
      expect(condition.compareValue).toBeTruthy()
    }
  })
})
