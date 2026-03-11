import type { Segment } from '@segments/lib/segments/segments.entity'
import { segments } from '@segments/lib/segments/segments.schema'
import type { SegmentCreatePayload } from '@segments/lib/segments/types'
import type { BaseRepository } from '@/lib/core/base.repository'
import BaseDrizzleRepository from '@/lib/core/base-drizzle.repository'

export interface SegmentsRepository extends BaseRepository {
  createOne(workspaceId: string, createdById: string, payload: SegmentCreatePayload): Promise<Segment>
}

class SegmentsDrizzleRepository extends BaseDrizzleRepository implements SegmentsRepository {
  async createOne(workspaceId: string, createdById: string, payload: SegmentCreatePayload) {
    const [created] = await this.db
      .insert(segments)
      .values({ ...payload, workspaceId, createdById })
      .returning()
    return created
  }
}

export default SegmentsDrizzleRepository
