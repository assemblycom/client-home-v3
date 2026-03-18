import type { Condition } from '@segments/lib/conditions/conditions.entity'
import { conditions } from '@segments/lib/conditions/conditions.schema'
import type { ConditionCreatePayload, ConditionUpdatePayload } from '@segments/lib/conditions/types'
import { eq } from 'drizzle-orm'
import type { BaseRepository } from '@/lib/core/base.repository'
import BaseDrizzleRepository from '@/lib/core/base-drizzle.repository'

export interface ConditionsRepository extends BaseRepository {
  getBySegmentId(segmentId: string): Promise<Condition[]>
  createMany(segmentId: string, payloads: ConditionCreatePayload[]): Promise<Condition[]>
  updateOne(conditionId: string, payload: ConditionUpdatePayload): Promise<Condition>
  deleteBySegmentId(segmentId: string): Promise<void>
}

class ConditionsDrizzleRepository extends BaseDrizzleRepository implements ConditionsRepository {
  async getBySegmentId(segmentId: string) {
    return await this.db.select().from(conditions).where(eq(conditions.segmentId, segmentId))
  }

  async createMany(segmentId: string, payloads: ConditionCreatePayload[]) {
    return await this.db
      .insert(conditions)
      .values(payloads.map((p) => ({ ...p, segmentId })))
      .returning()
  }

  async updateOne(conditionId: string, payload: ConditionUpdatePayload) {
    const [updated] = await this.db.update(conditions).set(payload).where(eq(conditions.id, conditionId)).returning()
    return updated
  }

  async deleteBySegmentId(segmentId: string) {
    await this.db.delete(conditions).where(eq(conditions.segmentId, segmentId))
  }
}

export default ConditionsDrizzleRepository
