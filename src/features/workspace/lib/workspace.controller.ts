import AssemblyClient from '@assembly/assembly-client'
import { authenticateHeaders } from '@auth/lib/authenticate'
import { type NextRequest, NextResponse } from 'next/server'
import type { APIResponse } from '@/app/types'

/**
 * Retrieves workspace for the current user
 */
export const getWorkspaceDetail = async (req: NextRequest): Promise<NextResponse<APIResponse>> => {
  const user = authenticateHeaders(req.headers)

  const assembly = new AssemblyClient(user.token)

  const workspace = await assembly.getWorkspace()

  return NextResponse.json({
    data: workspace,
  })
}
