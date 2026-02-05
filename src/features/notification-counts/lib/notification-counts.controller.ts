import { authenticateHeaders } from '@auth/lib/authenticate'
import { HttpStatusCode } from 'axios'
import { type NextRequest, NextResponse } from 'next/server'
import type { APIResponse } from '@/app/types'
import APIError from '@/errors/api.error'
import NotificationsCountService from './notification-counts.service'

export const getAllUserNotificationCounts = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<APIResponse>> => {
  const user = authenticateHeaders(req.headers)
  const clientId = (await params).id

  if (!clientId) throw new APIError('Client ID is required', HttpStatusCode.BadRequest)

  const notificationCountService = NotificationsCountService.new(user)
  const notificationCounts = await notificationCountService.getNotificationCountsForClient(clientId)

  return NextResponse.json({
    data: notificationCounts,
  })
}
