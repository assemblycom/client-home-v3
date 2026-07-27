import { authenticateHeaders } from '@auth/lib/authenticate'
import InstalledAppsService from '@installed-apps/lib/installed-apps.service'
import { type NextRequest, NextResponse } from 'next/server'
import type { APIResponse } from '@/app/types'

export const getActionableInstalls = async (req: NextRequest): Promise<NextResponse<APIResponse>> => {
  const user = authenticateHeaders(req.headers)

  const installedAppsService = InstalledAppsService.new(user)
  const actionableInstalls = await installedAppsService.getActionableInstalls()

  return NextResponse.json({ data: actionableInstalls })
}
