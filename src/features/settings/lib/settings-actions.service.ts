import AssemblyClient from '@assembly/assembly-client'
import type { User } from '@auth/lib/user.entity'
import { DEFAULT_BANNER_IMAGE_PATH } from '@media/constants'
import MediaDrizzleRepository, { type MediaRepository } from '@media/lib/media.repository'
import { defaultContent } from '@settings/constants'
import type { ActionsRepository } from '@settings/lib/actions/actions.repository'
import ActionsDrizzleRepository from '@settings/lib/actions/actions.repository'
import type SettingsRepository from '@settings/lib/settings/settings.repository'
import SettingsDrizzleRepository from '@settings/lib/settings/settings.repository'
import type { SettingsUpdateDto } from '@settings/lib/settings-actions.dto'
import type { SettingsWithActions } from '@settings/lib/settings-actions.entity'
import {
  SettingsActionsDrizzleQueryRepository,
  type SettingsActionsQueryRepository,
} from '@settings/lib/settings-actions.query.repository'
import db from '@/db'
import { SettingsUpdateSchema } from '@/features/settings/lib/types'
import BaseService from '@/lib/core/base.service'
import DBService from '@/lib/core/db.service'

export default class SettingsActionsService extends BaseService {
  constructor(
    readonly user: User,
    readonly assembly: AssemblyClient,
    private readonly queryRepository: SettingsActionsQueryRepository,
    private readonly settingsRepository: SettingsRepository,
    private readonly actionsRepository: ActionsRepository,
    private readonly mediaRepository: MediaRepository,
  ) {
    super(user, assembly)
  }

  /**
   * Scaffold a new SettingsActionsService with wired dependencies
   * @param user
   * @returns
   */
  static new(user: User) {
    const assembly = new AssemblyClient(user.token)
    const settingsRepository = new SettingsDrizzleRepository(db)
    const actionsRepository = new ActionsDrizzleRepository(db)
    const settingsActionsQueryRepository = new SettingsActionsDrizzleQueryRepository(db)
    const mediaRepository = new MediaDrizzleRepository(db)

    return new SettingsActionsService(
      user,
      assembly,
      settingsActionsQueryRepository,
      settingsRepository,
      actionsRepository,
      mediaRepository,
    )
  }

  async getForWorkspace(segmentId?: string | null): Promise<SettingsWithActions> {
    const settingsAndActions = await this.queryRepository.getOne(this.user.workspaceId, segmentId)

    // Handle missing settings and/or actions
    if (!settingsAndActions?.settings || !settingsAndActions?.actions) {
      const defaultBanner = await this.mediaRepository.getByPath(DEFAULT_BANNER_IMAGE_PATH)
      return await DBService.transaction(async (tx) => {
        this.settingsRepository.setTx(tx)
        this.actionsRepository.setTx(tx)

        try {
          const newSettings =
            settingsAndActions?.settings ||
            (await this.settingsRepository.createOne(this.user.workspaceId, {
              content: defaultContent,
              bannerImageId: defaultBanner?.id || null,
            }))
          const actions =
            settingsAndActions?.actions ||
            (await this.actionsRepository.createOne(this.user.workspaceId, {
              settingsId: newSettings.id,
            }))

          return { ...newSettings, actions }
        } finally {
          // Prevent transaction leakage across requests
          this.settingsRepository.unsetTx()
          this.actionsRepository.unsetTx()
        }
      })
    }

    return {
      ...settingsAndActions.settings,
      actions: settingsAndActions.actions,
    }
  }

  async updateForWorkspace(payload: SettingsUpdateDto, segmentId?: string | null) {
    const settingsPayload = SettingsUpdateSchema.parse(payload) // parsed again just to retrieve necessary keys
    const actionsPayload = payload.actions || {}
    const settingsAndActions = await this.queryRepository.getOne(this.user.workspaceId, segmentId)

    return await DBService.transaction(async (tx) => {
      this.settingsRepository.setTx(tx)
      this.actionsRepository.setTx(tx)

      try {
        const updatedSettings = Object.keys(settingsPayload).length
          ? await this.settingsRepository.updateOne(this.user.workspaceId, settingsPayload, segmentId)
          : settingsAndActions?.settings

        const actions =
          Object.keys(actionsPayload).length && settingsAndActions?.settings
            ? await this.actionsRepository.updateOne(settingsAndActions.settings.id, actionsPayload)
            : settingsAndActions?.actions

        return { ...updatedSettings, actions }
      } finally {
        // Prevent transaction leakage across requests
        this.settingsRepository.unsetTx()
        this.actionsRepository.unsetTx()
      }
    })
  }
}
