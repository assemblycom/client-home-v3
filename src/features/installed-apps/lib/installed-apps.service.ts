import AssemblyClient from '@assembly/assembly-client'
import { type AppInstallsData, isActionLabelRegistered } from '@assembly/types'
import type { User } from '@auth/lib/user.entity'
import type { ActionableInstallDto } from '@installed-apps/installed-apps.dto'
import BaseService from '@/lib/core/base.service'
import logger from '@/lib/logger'

type ActiveInstall = AppInstallsData & { id: string; appId: string }

export default class InstalledAppsService extends BaseService {
  constructor(
    readonly user: User,
    readonly assembly: AssemblyClient,
  ) {
    super(user, assembly)
  }

  static new(user: User) {
    const assembly = new AssemblyClient(user.token)
    return new InstalledAppsService(user, assembly)
  }

  // Returns installs eligible for "Your Actions": active (not disabled/draft/internal) and carrying a
  // complete registered action label. Discovery is a two-step fetch — list installs, then fan out to
  // each install's notification settings — because the list endpoint does not inline the action label.
  async getActionableInstalls(): Promise<ActionableInstallDto[]> {
    const installs = await this.assembly.getInstalls()

    const activeInstalls = installs.filter((install): install is ActiveInstall =>
      Boolean(install.id && install.appId && !install.disabled && !install.isDraft && !install.isInternalApp),
    )

    const results = await Promise.all(
      activeInstalls.map(async (install): Promise<ActionableInstallDto | null> => {
        try {
          const { actionLabel } = await this.assembly.getInstallNotificationSettings(install.id)
          // Skip installs that have not registered a complete action label.
          if (!isActionLabelRegistered(actionLabel)) return null

          return {
            installId: install.id,
            appId: install.appId,
            displayName: install.displayName ?? '',
            icon: install.icon ?? null,
            actionLabel,
          }
        } catch (error) {
          // One failing sub-resource fetch must not fail the whole endpoint — skip this install.
          logger.error(
            `InstalledAppsService#getActionableInstalls | notification-settings fetch failed for install ${install.id}`,
            error,
          )
          return null
        }
      }),
    )

    return results.filter((result): result is ActionableInstallDto => result !== null)
  }
}
