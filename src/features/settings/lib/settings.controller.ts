import AssemblyClient from '@assembly/assembly-client'
import { authenticateHeaders } from '@auth/lib/authenticate'
import SettingsDrizzleRepository from '@settings/lib/settings.repository'
import SettingsService from '@settings/lib/settings.service'
import { type NextRequest, NextResponse } from 'next/server'
import type { APIResponse } from '@/app/types'
import db from '@/db'

/**
 * Retrieves settings for the current workspace
 */
export const getSettings = async (req: NextRequest): Promise<NextResponse<APIResponse>> => {
  const user = authenticateHeaders(req.headers)

  // Wire dependencies for settings service
  const assembly = new AssemblyClient(user.token)
  const settingsRepository = new SettingsDrizzleRepository(db)
  const settingsService = new SettingsService(user, assembly, settingsRepository)

  const settings = await settingsService.getForWorkspace()

  return NextResponse.json({
    data: settings,
  })
}
