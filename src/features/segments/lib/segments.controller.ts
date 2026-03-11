import { authenticateHeaders } from '@auth/lib/authenticate'
import { SegmentCreateDtoSchema } from '@segments/lib/segments.dto'
import SegmentsService from '@segments/lib/segments.service'
import httpStatus from 'http-status'
import { type NextRequest, NextResponse } from 'next/server'
import type { APIResponse } from '@/app/types'

export const createSegment = async (req: NextRequest): Promise<NextResponse<APIResponse>> => {
  const user = authenticateHeaders(req.headers)

  const body = await req.json()
  const parsedBody = SegmentCreateDtoSchema.parse(body)

  const segmentsService = SegmentsService.new(user)
  const segment = await segmentsService.create(parsedBody)

  return NextResponse.json({ data: segment }, { status: httpStatus.CREATED })
}
