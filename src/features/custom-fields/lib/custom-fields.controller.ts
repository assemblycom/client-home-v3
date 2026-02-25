import AssemblyClient from '@assembly/assembly-client'
import { authenticateHeaders } from '@auth/lib/authenticate'
import { type NextRequest, NextResponse } from 'next/server'
import type { APIResponse } from '@/app/types'

export const getCompanyCustomFields = async (
  req: NextRequest,
  { params }: { params: Promise<{ entityType: string }> },
): Promise<NextResponse<APIResponse>> => {
  const user = authenticateHeaders(req.headers)

  const assembly = new AssemblyClient(user.token)

  const { entityType } = await params

  if (entityType !== 'company' && entityType !== 'client') {
    return NextResponse.json(
      {
        message: 'Path not found.',
      },
      {
        status: 404,
      },
    )
  }

  const response = await assembly.getCompanyCustomFields()

  return NextResponse.json(response)
}

export const getClientCustomFields = async (req: NextRequest) => {
  const user = authenticateHeaders(req.headers)

  const assembly = new AssemblyClient(user.token)

  const response = await assembly.getClientCustomFields()

  return NextResponse.json(response)
}
