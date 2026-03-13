import type { SegmentConfig } from '@segments/lib/segment-configs/segment-configs.entity'
import { segmentConfigs } from '@segments/lib/segment-configs/segment-configs.schema'
import { eq } from 'drizzle-orm'
import type { BaseRepository } from '@/lib/core/base.repository'
import BaseDrizzleRepository from '@/lib/core/base-drizzle.repository'

export interface SegmentConfigsRepository extends BaseRepository {
  getByWorkspaceId(workspaceId: string): Promise<SegmentConfig | undefined>
  create(payload: {
    workspaceId: string
    customField: string
    customFieldId: string
    entityType: 'client' | 'company'
  }): Promise<SegmentConfig>
  deleteByWorkspaceId(workspaceId: string): Promise<SegmentConfig | undefined>
}

class SegmentConfigsDrizzleRepository extends BaseDrizzleRepository implements SegmentConfigsRepository {
  async getByWorkspaceId(workspaceId: string) {
    return await this.db.query.segmentConfigs.findFirst({
      where: eq(segmentConfigs.workspaceId, workspaceId),
    })
  }

  async create(payload: {
    workspaceId: string
    customField: string
    customFieldId: string
    entityType: 'client' | 'company'
  }) {
    const [created] = await this.db.insert(segmentConfigs).values(payload).returning()
    return created
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
