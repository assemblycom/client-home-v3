/**
 * Realistic test-data seeders for segment-related tables.
 *
 * - `seedSegments` / `seedSegmentConfig`: drizzle-seed powered bulk seeding with realistic values
 * - `insertSegmentConfig`: factory-style insert with overrides, used when a test needs control
 *   over specific fields without going through the repository
 */
import { CustomFieldEntityType } from '@assembly/types'
import { conditions } from '@segments/lib/conditions/conditions.schema'
import { segmentConfigs } from '@segments/lib/segment-config/segment-config.schema'
import { segments } from '@segments/lib/segments/segments.schema'
import { seed } from 'drizzle-seed'
import { TEST_WORKSPACE_ID, type TestDB } from '../setup/test-db'

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

type SegmentConfigOverrides = {
  workspaceId?: string
  customField?: string
  customFieldId?: string
  entityType?: CustomFieldEntityType
}

/** Factory-style insert for segment_configs rows — bypasses repository layer */
export const insertSegmentConfig = async (db: TestDB, overrides: SegmentConfigOverrides = {}) => {
  const [inserted] = await db
    .insert(segmentConfigs)
    .values({
      workspaceId: TEST_WORKSPACE_ID,
      customField: 'status',
      customFieldId: 'cf-status-1',
      entityType: CustomFieldEntityType.CLIENT,
      ...overrides,
    })
    .returning()
  return inserted
}
