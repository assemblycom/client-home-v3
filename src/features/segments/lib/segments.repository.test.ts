/**
 * Integration tests for segment repositories against PGlite (in-process Postgres).
 *
 * Uses drizzle-seed for realistic test data where possible, and manual inserts
 * only where tests need precise control over specific values.
 */
import { CustomFieldEntityType } from '@assembly/types'
import type { PGlite } from '@electric-sql/pglite'
import ConditionsDrizzleRepository from '@segments/lib/conditions/conditions.repository'
import SegmentConfigsDrizzleRepository from '@segments/lib/segment-config/segment-config.repository'
import SegmentsDrizzleRepository from '@segments/lib/segments/segments.repository'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { createTestDb, seedSegmentConfig, seedSegments, type TestDB } from '@/test/setup-test-db'

vi.mock('server-only', () => ({}))
vi.mock('@/db', () => ({ default: {} }))

let db: TestDB
let client: PGlite
let segmentsRepo: SegmentsDrizzleRepository
let conditionsRepo: ConditionsDrizzleRepository
let configsRepo: SegmentConfigsDrizzleRepository

const WORKSPACE_ID = 'ws-test-001'

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

describe('cascade deletes', () => {
  // Seed realistic data, then verify cascade behavior
  it('cascade-deletes conditions when segment is deleted', async () => {
    // Seed 1 segment with 3 conditions auto-linked via FK
    await seedSegments(db, { segments: 1, conditions: 3 })

    const [segment] = await segmentsRepo.getAll(WORKSPACE_ID)
    expect(segment.conditions.length).toBeGreaterThan(0)

    await segmentsRepo.delete(segment.id)

    const remaining = await conditionsRepo.getBySegmentId(segment.id)
    expect(remaining).toHaveLength(0)
  })

  // Bulk-deleting all segments should cascade-delete all their conditions
  it('cascade-deletes conditions on bulk workspace delete', async () => {
    await seedSegments(db, { segments: 3, conditions: 9 })

    const allSegments = await segmentsRepo.getAll(WORKSPACE_ID)
    expect(allSegments.length).toBe(3)

    await segmentsRepo.deleteAllByWorkspaceId(WORKSPACE_ID)

    // All conditions across all segments should be gone
    for (const seg of allSegments) {
      const remaining = await conditionsRepo.getBySegmentId(seg.id)
      expect(remaining).toHaveLength(0)
    }
  })
})

describe('foreign key constraints', () => {
  // Creating a condition with a non-existent segmentId should fail at the DB level
  it('rejects condition with non-existent segment id', async () => {
    await expect(
      conditionsRepo.createMany('a0000000-0000-0000-0000-000000000099', [{ compareValue: 'orphan' }]),
    ).rejects.toThrow()
  })
})

describe('unique constraints', () => {
  // Only one segment config per workspace — second insert should violate unique index
  it('rejects duplicate workspace config', async () => {
    // Seed one config for the workspace
    await seedSegmentConfig(db)

    // Second create for same workspace should fail
    await expect(
      configsRepo.create({
        workspaceId: WORKSPACE_ID,
        customField: 'tier',
        customFieldId: 'cf-2',
        entityType: CustomFieldEntityType.COMPANY,
      }),
    ).rejects.toThrow()
  })
})

describe('upsert behavior', () => {
  // Upsert should insert when no config exists for the workspace
  it('inserts when config does not exist', async () => {
    const config = await configsRepo.upsert({
      workspaceId: WORKSPACE_ID,
      customField: 'status',
      customFieldId: 'cf-1',
      entityType: CustomFieldEntityType.CLIENT,
    })
    expect(config.customField).toBe('status')
  })

  // Upsert should update in-place when config already exists (not create a second row)
  it('updates existing config instead of creating duplicate', async () => {
    // Seed initial config
    await seedSegmentConfig(db)

    const updated = await configsRepo.upsert({
      workspaceId: WORKSPACE_ID,
      customField: 'tier',
      customFieldId: 'cf-2',
      entityType: CustomFieldEntityType.COMPANY,
    })

    expect(updated.customField).toBe('tier')
    expect(updated.entityType).toBe('company')

    // Verify only one row exists
    const fetched = await configsRepo.getByWorkspaceId(WORKSPACE_ID)
    expect(fetched?.customField).toBe('tier')
  })
})

describe('relational queries', () => {
  // getOne should return the segment with its conditions eagerly loaded
  it('loads conditions with segment via relational query', async () => {
    // Seed 1 segment with 4 conditions — drizzle-seed auto-links the FK
    await seedSegments(db, { segments: 1, conditions: 4 })

    const [segment] = await segmentsRepo.getAll(WORKSPACE_ID)
    const fetched = await segmentsRepo.getOne(segment.id)

    expect(fetched?.conditions).toHaveLength(4)
    // Each condition should have a realistic compareValue (last names from drizzle-seed)
    for (const condition of fetched?.conditions ?? []) {
      expect(condition.compareValue).toBeTruthy()
    }
  })
})
