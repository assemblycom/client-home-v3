import type { Condition } from '@segments/lib/conditions/conditions.entity'
import { conditions } from '@segments/lib/conditions/conditions.schema'
import type { ConditionCreatePayload } from '@segments/lib/conditions/types'
import type { BaseRepository } from '@/lib/core/base.repository'
import BaseDrizzleRepository from '@/lib/core/base-drizzle.repository'

export interface ConditionsRepository extends BaseRepository {
  createMany(segmentId: string, payloads: ConditionCreatePayload[]): Promise<Condition[]>
}

class ConditionsDrizzleRepository extends BaseDrizzleRepository implements ConditionsRepository {
  async createMany(segmentId: string, payloads: ConditionCreatePayload[]) {
    return await this.db
      .insert(conditions)
      .values(payloads.map((p) => ({ ...p, segmentId })))
      .returning()
  }
}

export default ConditionsDrizzleRepository
