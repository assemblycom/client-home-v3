import type AssemblyClient from '@assembly/assembly-client'
import type { User } from '@auth/lib/user.entity'
import type { ActionsRepository } from '@settings/lib/actions/actions.repository'
import { defaultContent } from '@settings/lib/constants'
import type SettingsRepository from '@settings/lib/settings/settings.repository'
import type { SettingsWithActions } from '@settings/lib/settings-actions.entity'
import type { SettingsActionsQueryRepository } from '@settings/lib/settings-actions.query.repository'
import BaseService from '@/lib/core/base.service'
import DBService from '@/lib/core/db.service'

export default class SettingsActionsService extends BaseService {
  constructor(
    protected readonly user: User,
    protected readonly assembly: AssemblyClient,
    protected readonly queryRepository: SettingsActionsQueryRepository,
    protected readonly settingsRepository: SettingsRepository,
    protected readonly actionsRepository: ActionsRepository,
  ) {
    super(user, assembly)
  }

  async getForWorkspace(): Promise<SettingsWithActions> {
    const settingsAndActions = await this.queryRepository.getOne(this.user.workspaceId)

    // Handle missing settings and/or actions
    if (!settingsAndActions?.settings || !settingsAndActions?.actions) {
      return await DBService.transaction(async (tx) => {
        this.settingsRepository.setTx(tx)
        this.actionsRepository.setTx(tx)

        try {
          const newSettings =
            settingsAndActions?.settings ||
            (await this.settingsRepository.createOne(this.user.workspaceId, {
              content: defaultContent,
              // We can add default banner img here later
              // bannerImageId: null,
            }))
          const actions =
            settingsAndActions?.actions ||
            (await this.actionsRepository.createOne(this.user.workspaceId, { settingsId: newSettings.id }))

          return { ...newSettings, actions }
        } finally {
          // Prevent transaction leakage across requests
          this.settingsRepository.unsetTx()
          this.actionsRepository.unsetTx()
        }
      })
    }

    return { ...settingsAndActions.settings, actions: settingsAndActions.actions }
  }
}
