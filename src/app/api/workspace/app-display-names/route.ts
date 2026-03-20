import AssemblyClient from '@assembly/assembly-client'
import { authenticateHeaders } from '@auth/lib/authenticate'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { APIResponse } from '@/app/types'
import { withErrorHandler } from '@/lib/with-error-handler'

export const GET = withErrorHandler(async (req: NextRequest): Promise<NextResponse<APIResponse>> => {
  const user = authenticateHeaders(req.headers)

  const assembly = new AssemblyClient(z.string().parse(user.token))
  const displayNames = await assembly.getAppDisplayNames()
  return NextResponse.json({ data: displayNames })
})
