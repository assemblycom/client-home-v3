import type { Actions } from '@settings/lib/actions/actions.entity'
import { actions } from '@settings/lib/actions/actions.schema'
import type { ActionsCreatePayload, ActionsUpdatePayload } from '@settings/lib/actions/types'
import { eq } from 'drizzle-orm'
import httpStatus from 'http-status'
import APIError from '@/errors/api.error'
import type { BaseRepository } from '@/lib/core/base.repository'
import BaseDrizzleRepository from '@/lib/core/base-drizzle.repository'

/**
 * Injectable settings repository interface
 */
export interface ActionsRepository extends BaseRepository {
  getOne(workspaceId: string): Promise<Actions | null>
  createOne(workspaceId: string, payload: ActionsCreatePayload): Promise<Actions>
  updateOne(workspaceId: string, payload: ActionsUpdatePayload): Promise<Actions>
}

/**
 * Settings repository implementation with Drizzle
 */
class ActionsDrizzleRepository extends BaseDrizzleRepository implements ActionsRepository {
  async createOne(workspaceId: string, payload: ActionsCreatePayload) {
    return await this.db.transaction(async (tx) => {
      this.setTx(tx)
      try {
        const [created] = await this.db
          .insert(actions)
          .values({ ...payload, workspaceId })
          .onConflictDoNothing()
          .returning()
        if (created) return created

        // Handle race conditions
        const after = await this.getOne(workspaceId)
        if (!after) {
          throw new APIError('Failed to create settings', httpStatus.INTERNAL_SERVER_ERROR)
        }
        return after
      } finally {
        this.unsetTx()
      }
    })
  }

  async updateOne(workspaceId: string, payload: ActionsUpdatePayload) {
    const [updated] = await this.db.update(actions).set(payload).where(eq(actions.workspaceId, workspaceId)).returning()
    return updated
  }

  async getOne(workspaceId: string) {
    const [result] = await this.db.select().from(actions).where(eq(actions.workspaceId, workspaceId)).limit(1)
    return result || null
  }
}

export default ActionsDrizzleRepository
