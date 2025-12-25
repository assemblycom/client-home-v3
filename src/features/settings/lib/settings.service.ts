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

  getForWorkspace() {
    return this.repository.getOne(this.user.workspaceId)
  }

  createForWorkspace(payload: SettingsCreatePayload) {
    return this.repository.createOne(this.user.workspaceId, payload)
  }
}
