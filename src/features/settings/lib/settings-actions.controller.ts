import { authenticateHeaders } from '@auth/lib/authenticate'
import { SettingsUpdateDtoSchema } from '@settings/lib/settings-actions.dto'
import SettingsActionsService from '@settings/lib/settings-actions.service'
import { type NextRequest, NextResponse } from 'next/server'
import type { APIResponse } from '@/app/types'

export const getSettingsWithActions = async (req: NextRequest): Promise<NextResponse<APIResponse>> => {
  const user = authenticateHeaders(req.headers)
  const segmentId = req.nextUrl.searchParams.get('segmentId') || undefined

  const settingsService = SettingsActionsService.new(user)
  const settings = user.clientId
    ? await settingsService.getForClient()
    : await settingsService.getForWorkspace(segmentId)

  return NextResponse.json({
    data: settings,
  })
}

export const updateSettingsWithActions = async (req: NextRequest): Promise<NextResponse<APIResponse>> => {
  const user = authenticateHeaders(req.headers)
  const segmentId = req.nextUrl.searchParams.get('segmentId') || undefined

  const body = await req.json()
  const parsedBody = SettingsUpdateDtoSchema.parse(body)

  const settingsService = SettingsActionsService.new(user)
  const settings = await settingsService.updateForWorkspace(parsedBody, segmentId)

  return NextResponse.json({
    data: settings,
  })
}
