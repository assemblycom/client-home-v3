import type { Actions } from '@settings/lib/actions/actions.entity'
import { actions } from '@settings/lib/actions/actions.schema'
import type { Settings } from '@settings/lib/settings/settings.entity'
import { settings } from '@settings/lib/settings/settings.schema'
import { and, eq, isNull } from 'drizzle-orm'
import type { BaseRepository } from '@/lib/core/base.repository'
import BaseDrizzleRepository from '@/lib/core/base-drizzle.repository'

export interface SettingsActionsQueryRepository extends BaseRepository {
  getOne(
    workspaceId: string,
    segmentId?: string | null,
  ): Promise<{ settings: Settings; actions: Actions | null } | null>
}

export class SettingsActionsDrizzleQueryRepository
  extends BaseDrizzleRepository
  implements SettingsActionsQueryRepository
{
  async getOne(workspaceId: string, segmentId?: string | null) {
    const segmentFilter = segmentId ? eq(settings.segmentId, segmentId) : isNull(settings.segmentId)

    const [result] = await this.db
      .select()
      .from(settings)
      .leftJoin(actions, eq(actions.settingsId, settings.id))
      .where(and(eq(settings.workspaceId, workspaceId), segmentFilter))
      .limit(1)
    return result || null
  }
}
