import { authenticateHeaders } from '@auth/lib/authenticate'
import UsersService from '@users/lib/users.service'
import { type NextRequest, NextResponse } from 'next/server'
import type { APIResponse } from '@/app/types'

export const getAllUsers = async (req: NextRequest): Promise<NextResponse<APIResponse>> => {
  const user = authenticateHeaders(req.headers)

  const usersService = UsersService.new(user)
  const clients = await usersService.getClients()

  return NextResponse.json({
    data: clients,
  })
}
