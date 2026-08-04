import { AppInstallStatus, type AppInstallsData } from '@assembly/types'
import InstalledAppsService from '@installed-apps/lib/installed-apps.service'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createInternalUser } from '../factories'

vi.mock('server-only', () => ({}))
vi.mock('@assembly/assembly-client', () => ({ default: vi.fn() }))
vi.mock('@/config/env', () => ({ default: { TASKS_APP_ID: 'tasks-app-id' } }))

// A fully-registered action label — required for an install to become "actionable".
const REGISTERED_LABEL = { verb: 'sign', singularNoun: 'document', pluralNoun: 'documents' }

const createInstall = (overrides: Partial<AppInstallsData> = {}): AppInstallsData => ({
  id: 'install-1',
  appId: 'app-1',
  displayName: 'App One',
  icon: 'folder',
  disabled: false,
  isDraft: false,
  isInternalApp: false,
  status: AppInstallStatus.PUBLISHED,
  ...overrides,
})

// Builds the service against a stubbed AssemblyClient. `labels` maps installId → the action label
// its notification-settings fetch returns; installs not listed fall back to REGISTERED_LABEL.
const buildService = (installs: AppInstallsData[], labels: Record<string, unknown> = {}) => {
  const getInstalls = vi.fn().mockResolvedValue(installs)
  const getInstallNotificationSettings = vi.fn(async (id: string) => ({
    actionLabel: id in labels ? labels[id] : REGISTERED_LABEL,
  }))
  const assembly = { getInstalls, getInstallNotificationSettings }
  const service = new InstalledAppsService(createInternalUser(), assembly as never)
  return { service, getInstalls, getInstallNotificationSettings }
}

describe('InstalledAppsService#getActionableInstalls', () => {
  beforeEach(() => vi.clearAllMocks())

  it('hides app-builder drafts and never fetches their notification settings', async () => {
    const { service, getInstallNotificationSettings } = buildService([
      createInstall({ id: 'draft-1', appId: 'app-draft', status: AppInstallStatus.DRAFT }),
      createInstall({ id: 'pub-1', appId: 'app-pub', status: AppInstallStatus.PUBLISHED }),
    ])

    const result = await service.getActionableInstalls()

    expect(result.map((r) => r.installId)).toEqual(['pub-1'])
    expect(getInstallNotificationSettings).toHaveBeenCalledTimes(1)
    expect(getInstallNotificationSettings).toHaveBeenCalledWith('pub-1')
  })

  it('includes a published install carrying a registered action label', async () => {
    const { service } = buildService([createInstall({ id: 'pub-1', appId: 'app-pub' })])

    const result = await service.getActionableInstalls()

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ installId: 'pub-1', appId: 'app-pub', actionLabel: REGISTERED_LABEL })
  })

  it('shows only published installs — anything not published is hidden (allowlist)', async () => {
    const { service } = buildService([
      createInstall({ id: 'draft-1', appId: 'app-draft', status: AppInstallStatus.DRAFT }),
      createInstall({ id: 'unknown-1', appId: 'app-unknown', status: undefined }),
      createInstall({ id: 'null-1', appId: 'app-null', status: null }),
    ])

    const result = await service.getActionableInstalls()

    expect(result).toEqual([])
  })

  it('excludes a published install that has not registered a complete action label', async () => {
    const { service } = buildService([createInstall({ id: 'pub-1', appId: 'app-pub' })], {
      'pub-1': { verb: 'sign', singularNoun: '', pluralNoun: '' },
    })

    const result = await service.getActionableInstalls()

    expect(result).toEqual([])
  })
})
