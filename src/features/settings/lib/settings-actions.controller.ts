import AssemblyClient from '@assembly/assembly-client'
import { authenticateHeaders } from '@auth/lib/authenticate'
import ActionsDrizzleRepository from '@settings/lib/actions/actions.repository'
import SettingsDrizzleRepository from '@settings/lib/settings/settings.repository'
import { SettingsActionsDrizzleQueryRepository } from '@settings/lib/settings-actions.query.repository'
import SettingsActionsService from '@settings/lib/settings-actions.service'
import { type NextRequest, NextResponse } from 'next/server'
import type { APIResponse } from '@/app/types'
import db from '@/db'

/**
 * Retrieves settings for the current workspace
 */
export const getSettingsWithActions = async (req: NextRequest): Promise<NextResponse<APIResponse>> => {
  const user = authenticateHeaders(req.headers)

  // Wire dependencies for settings service
  const assembly = new AssemblyClient(user.token)
  const settingsRepository = new SettingsDrizzleRepository(db)
  const actionsRepository = new ActionsDrizzleRepository(db)
  const settingsActionsQueryRepository = new SettingsActionsDrizzleQueryRepository(db)

  const settingsService = new SettingsActionsService(
    user,
    assembly,
    settingsActionsQueryRepository,
    settingsRepository,
    actionsRepository,
  )

  const settings = await settingsService.getForWorkspace()

  return NextResponse.json({
    data: settings,
  })
}
