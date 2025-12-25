import type AssemblyClient from '@assembly/assembly-client'
import type { User } from '@auth/lib/user.entity'
import type SettingsRepository from '@settings/lib/settings.repository'
import type { SettingsCreatePayload } from '@settings/lib/types'
import BaseService from '@/lib/core/base.service'

export default class SettingsService extends BaseService {
  constructor(
    protected readonly user: User,
    protected readonly assembly: AssemblyClient,
    protected readonly repository: SettingsRepository,
  ) {
    super(user, assembly)
  }

  async getForWorkspace() {
    let settings = await this.repository.getOne(this.user.workspaceId)
    if (!settings) {
      settings = await this.repository.createOne(this.user.workspaceId, {
        content: '',
        backgroundColor: '#fff',
        bannerImageId: null,
      })
    }
    return settings
  }
}
