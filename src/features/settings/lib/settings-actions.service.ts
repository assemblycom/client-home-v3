import type AssemblyClient from '@assembly/assembly-client'
import type { User } from '@auth/lib/user.entity'
import { defaultContent } from '@settings/lib/constants'
import type SettingsRepository from '@settings/lib/settings/settings.repository'
import BaseService from '@/lib/core/base.service'
import type { Actions } from './actions/actions.entity'
import type { ActionsRepository } from './actions/actions.repository'
import type { Settings } from './settings/settings.entity'
import type { SettingsActionsQueryRepository } from './settings-actions.query.repository'

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

  async getForWorkspace(): Promise<Settings & { actions: Actions }> {
    const settingsAndActions = await this.queryRepository.getOne(this.user.workspaceId)

    // Handle missing settings and/or actions
    if (!settingsAndActions?.settings || !settingsAndActions?.actions) {
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
    }

    return { ...settingsAndActions.settings, actions: settingsAndActions.actions }
  }
}
