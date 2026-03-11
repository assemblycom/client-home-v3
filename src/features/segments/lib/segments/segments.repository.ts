import type { Segment } from '@segments/lib/segments/segments.entity'
import { segments } from '@segments/lib/segments/segments.schema'
import type { SegmentCreatePayload } from '@segments/lib/segments/types'
import type { SegmentResponseDto } from '@segments/lib/segments.dto'
import { and, eq, isNull } from 'drizzle-orm'
import type { BaseRepository } from '@/lib/core/base.repository'
import BaseDrizzleRepository from '@/lib/core/base-drizzle.repository'

export interface SegmentsRepository extends BaseRepository {
  createOne(workspaceId: string, createdById: string, payload: SegmentCreatePayload): Promise<Segment>
  getAll(workspaceId: string): Promise<SegmentResponseDto[]>
}

class SegmentsDrizzleRepository extends BaseDrizzleRepository implements SegmentsRepository {
  async createOne(workspaceId: string, createdById: string, payload: SegmentCreatePayload) {
    const [created] = await this.db
      .insert(segments)
      .values({ ...payload, workspaceId, createdById })
      .returning()
    return created
  }

  async getAll(workspaceId: string) {
    return await this.db.query.segments.findMany({
      where: and(eq(segments.workspaceId, workspaceId), isNull(segments.deletedAt)),
      with: { conditions: true },
    })
  }
}

export default SegmentsDrizzleRepository
