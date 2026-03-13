import type { CustomFieldEntityType } from '@assembly/types'
import type { SegmentConfig } from '@segments/lib/segment-config/segment-config.entity'
import { segmentConfigs } from '@segments/lib/segment-config/segment-config.schema'
import { eq } from 'drizzle-orm'
import type { BaseRepository } from '@/lib/core/base.repository'
import BaseDrizzleRepository from '@/lib/core/base-drizzle.repository'

type SegmentConfigPayload = {
  workspaceId: string
  customField: string
  customFieldId: string
  entityType: CustomFieldEntityType
}

export interface SegmentConfigsRepository extends BaseRepository {
  getByWorkspaceId(workspaceId: string): Promise<SegmentConfig | undefined>
  create(payload: SegmentConfigPayload): Promise<SegmentConfig>
  upsert(payload: SegmentConfigPayload): Promise<SegmentConfig>
  deleteByWorkspaceId(workspaceId: string): Promise<SegmentConfig | undefined>
}

class SegmentConfigsDrizzleRepository extends BaseDrizzleRepository implements SegmentConfigsRepository {
  async getByWorkspaceId(workspaceId: string) {
    return await this.db.query.segmentConfigs.findFirst({
      where: eq(segmentConfigs.workspaceId, workspaceId),
    })
  }

  async create(payload: SegmentConfigPayload) {
    const [created] = await this.db.insert(segmentConfigs).values(payload).returning()
    return created
  }

  async upsert(payload: SegmentConfigPayload) {
    const [upserted] = await this.db
      .insert(segmentConfigs)
      .values(payload)
      .onConflictDoUpdate({
        target: segmentConfigs.workspaceId,
        set: {
          customField: payload.customField,
          customFieldId: payload.customFieldId,
          entityType: payload.entityType,
        },
      })
      .returning()
    return upserted
  }

  async deleteByWorkspaceId(workspaceId: string) {
    const [deleted] = await this.db
      .delete(segmentConfigs)
      .where(eq(segmentConfigs.workspaceId, workspaceId))
      .returning()
    return deleted
  }
}

export default SegmentConfigsDrizzleRepository
