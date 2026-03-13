import type { Segment } from '@segments/lib/segments/segments.entity'
import { segments } from '@segments/lib/segments/segments.schema'
import type { SegmentCreatePayload } from '@segments/lib/segments/types'
import type { SegmentResponseDto } from '@segments/lib/segments.dto'
import { eq } from 'drizzle-orm'
import type { BaseRepository } from '@/lib/core/base.repository'
import BaseDrizzleRepository from '@/lib/core/base-drizzle.repository'

export interface SegmentsRepository extends BaseRepository {
  createOne(workspaceId: string, createdById: string, payload: SegmentCreatePayload): Promise<Segment>
  getOne(segmentId: string): Promise<SegmentResponseDto | undefined>
  getAll(workspaceId: string): Promise<SegmentResponseDto[]>
  updateOne(segmentId: string, payload: { name?: string }): Promise<Segment>
  delete(segmentId: string): Promise<Segment>
}

class SegmentsDrizzleRepository extends BaseDrizzleRepository implements SegmentsRepository {
  async createOne(workspaceId: string, createdById: string, payload: SegmentCreatePayload) {
    const [created] = await this.db
      .insert(segments)
      .values({ ...payload, workspaceId, createdById })
      .returning()
    return created
  }

  async getOne(segmentId: string) {
    return await this.db.query.segments.findFirst({
      where: eq(segments.id, segmentId),
      with: { conditions: true },
    })
  }

  async getAll(workspaceId: string) {
    return await this.db.query.segments.findMany({
      where: eq(segments.workspaceId, workspaceId),
      with: { conditions: true },
    })
  }

  async updateOne(segmentId: string, payload: { name?: string }) {
    const [updated] = await this.db.update(segments).set(payload).where(eq(segments.id, segmentId)).returning()
    return updated
  }

  async delete(segmentId: string) {
    const [deleted] = await this.db.delete(segments).where(eq(segments.id, segmentId)).returning()
    return deleted
  }
}

export default SegmentsDrizzleRepository
