import AssemblyClient from '@assembly/assembly-client'
import { authenticateHeaders } from '@auth/lib/authenticate'
import { type NextRequest, NextResponse } from 'next/server'
import type { APIResponse } from '@/app/types'

export const getCompanyCustomFields = async (req: NextRequest): Promise<NextResponse<APIResponse>> => {
  const user = authenticateHeaders(req.headers)

  const assembly = new AssemblyClient(user.token)

  const response = await assembly.getCompanyCustomFields()

  return NextResponse.json(response)
}

export const getClientCustomFields = async (req: NextRequest) => {
  const user = authenticateHeaders(req.headers)

  const assembly = new AssemblyClient(user.token)

  const response = await assembly.getClientCustomFields()

  return NextResponse.json(response)
}
