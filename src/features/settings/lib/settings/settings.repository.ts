import type { Settings } from '@settings/lib/settings/settings.entity'
import { settings } from '@settings/lib/settings/settings.schema'
import type { SettingsCreatePayload, SettingsUpdatePayload, SettingsWithSegment } from '@settings/lib/types'
import { and, eq, isNull } from 'drizzle-orm'
import httpStatus from 'http-status'
import APIError from '@/errors/api.error'
import type { BaseRepository } from '@/lib/core/base.repository'
import BaseDrizzleRepository from '@/lib/core/base-drizzle.repository'

/**
 * Injectable settings repository interface
 */
export interface SettingsRepository extends BaseRepository {
  getOne(workspaceId: string): Promise<Settings | null>
  getDefault(workspaceId: string): Promise<Settings | null>
  createOne(workspaceId: string, payload: SettingsCreatePayload): Promise<Settings>
  createForSegment(workspaceId: string, payload: SettingsCreatePayload): Promise<Settings>
  updateOne(workspaceId: string, payload: SettingsUpdatePayload, segmentId?: string | null): Promise<Settings>
  getSegments(workspaceId: string): Promise<SettingsWithSegment[]>
}

/**
 * Settings repository implementation with Drizzle
 */
class SettingsDrizzleRepository extends BaseDrizzleRepository implements SettingsRepository {
  async createOne(workspaceId: string, payload: SettingsCreatePayload) {
    return await this.db.transaction(async (tx) => {
      this.setTx(tx)
      try {
        const [created] = await this.db
          .insert(settings)
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

  async updateOne(workspaceId: string, payload: SettingsUpdatePayload, segmentId?: string | null) {
    const segmentFilter = segmentId ? eq(settings.segmentId, segmentId) : isNull(settings.segmentId)

    const [updated] = await this.db
      .update(settings)
      .set(payload)
      .where(and(eq(settings.workspaceId, workspaceId), segmentFilter))
      .returning()
    return updated
  }

  async getOne(workspaceId: string) {
    const [result] = await this.db.select().from(settings).where(eq(settings.workspaceId, workspaceId)).limit(1)
    return result || null
  }

  async getDefault(workspaceId: string) {
    const [result] = await this.db
      .select()
      .from(settings)
      .where(and(eq(settings.workspaceId, workspaceId), isNull(settings.segmentId)))
      .limit(1)
    return result || null
  }

  async createForSegment(workspaceId: string, payload: SettingsCreatePayload) {
    const [created] = await this.db
      .insert(settings)
      .values({ ...payload, workspaceId })
      .onConflictDoNothing()
      .returning()

    if (!created) {
      throw new APIError('Failed to create segment settings', httpStatus.INTERNAL_SERVER_ERROR)
    }

    return created
  }

  async getSegments(workspaceId: string): Promise<SettingsWithSegment[]> {
    const result = await this.db.query.settings.findMany({
      where: eq(settings.workspaceId, workspaceId),
      columns: {
        id: true,
        workspaceId: true,
        segmentId: true,
      },
      with: {
        segment: {
          with: {
            conditions: true,
          },
        },
      },
      orderBy: (s, { asc }) => asc(s.createdAt),
    })

    return result.sort((a, b) => {
      if (a.segmentId === null) return 1
      if (b.segmentId === null) return -1
      return 0
    })
  }
}

export default SettingsDrizzleRepository
