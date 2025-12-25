import type { Settings } from '@settings/lib/settings.entity'
import { settings } from '@settings/lib/settings.schema'
import type { SettingsCreatePayload } from '@settings/lib/types'
import { eq } from 'drizzle-orm'
import httpStatus from 'http-status'
import APIError from '@/errors/api.error'
import BaseDrizzleRepository from '@/lib/core/base-drizzle.repository'

/**
 * Injectable settings repository interface
 */
export interface SettingsRepository {
  getOne(workspaceId: string): Promise<Settings | null>
  createOne(workspaceId: string, payload: SettingsCreatePayload): Promise<Settings>
}

/**
 * Settings repository implementation with Drizzle
 */
class SettingsDrizzleRepository extends BaseDrizzleRepository implements SettingsRepository {
  async getOrCreate(workspaceId: string, payload: SettingsCreatePayload) {
    return await this.db.transaction(async (tx) => {
      this.setTx(tx)
      try {
        const existingSettings = await this.getOne(workspaceId)
        if (existingSettings) return existingSettings

        const created = await this.createOne(workspaceId, payload)
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

  async getOne(workspaceId: string) {
    const [result] = await this.db.select().from(settings).where(eq(settings.workspaceId, workspaceId)).limit(1)
    return result || null
  }

  async createOne(workspaceId: string, payload: SettingsCreatePayload) {
    const [result] = await this.db
      .insert(settings)
      .values({ ...payload, workspaceId })
      .onConflictDoNothing()
      .returning()
    return result
  }
}

export default SettingsDrizzleRepository
