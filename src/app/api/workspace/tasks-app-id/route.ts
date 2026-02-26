import AssemblyClient from '@assembly/assembly-client'
import { authenticateHeaders } from '@auth/lib/authenticate'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { APIResponse } from '@/app/types'
import env from '@/config/env'
import { withErrorHandler } from '@/lib/with-error-handler'

export const GET = withErrorHandler(async (req: NextRequest): Promise<NextResponse<APIResponse>> => {
  const user = authenticateHeaders(req.headers)

  const assembly = new AssemblyClient(z.string().parse(user.token))
  const appId = await assembly.getAppId(env.TASKS_APP_ID)
  return NextResponse.json({ data: appId })
})
