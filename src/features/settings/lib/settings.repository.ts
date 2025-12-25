import type { Settings } from '@settings/lib/settings.entity'
import type { SettingsCreatePayload } from '@settings/lib/types'
import { eq } from 'drizzle-orm'
import { settings } from '@/features/settings/lib/settings.schema'
import BaseDrizzleRepository from '@/lib/core/base-drizzle.repository'

/**
 * Injectable settings repository interface
 */
export interface SettingsRepository {
  getOne(workspaceId: string): Promise<Settings | null>
  createOne(workspaceId: string, payload: SettingsCreatePayload): Promise<void>
}

/**
 * Settings repository implementation with Drizzle DB
 */
class DrizzleSettingsRepository extends BaseDrizzleRepository implements SettingsRepository {
  async getOne(workspaceId: string) {
    const [result] = await this.db.select().from(settings).where(eq(settings.workspaceId, workspaceId)).limit(1)
    return result || null
  }

  async createOne(workspaceId: string, payload: SettingsCreatePayload) {
    await this.db.insert(settings).values({ ...payload, workspaceId })
  }
}

export default DrizzleSettingsRepository
