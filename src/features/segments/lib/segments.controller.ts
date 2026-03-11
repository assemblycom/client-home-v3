import { authenticateHeaders } from '@auth/lib/authenticate'
import { SegmentCreateDtoSchema, SegmentUpdateDtoSchema } from '@segments/lib/segments.dto'
import SegmentsService from '@segments/lib/segments.service'
import httpStatus from 'http-status'
import { type NextRequest, NextResponse } from 'next/server'
import type { APIResponse } from '@/app/types'

export const getSegmentStats = async (req: NextRequest): Promise<NextResponse<APIResponse>> => {
  const user = authenticateHeaders(req.headers)

  const segmentsService = SegmentsService.new(user)
  const stats = await segmentsService.getStats()

  return NextResponse.json({ data: stats })
}

export const getSegments = async (req: NextRequest): Promise<NextResponse<APIResponse>> => {
  const user = authenticateHeaders(req.headers)

  const segmentsService = SegmentsService.new(user)
  const segments = await segmentsService.getAll()

  return NextResponse.json({ data: segments })
}

export const createSegment = async (req: NextRequest): Promise<NextResponse<APIResponse>> => {
  const user = authenticateHeaders(req.headers)

  const body = await req.json()
  const parsedBody = SegmentCreateDtoSchema.parse(body)

  const segmentsService = SegmentsService.new(user)
  const segment = await segmentsService.create(parsedBody)

  return NextResponse.json({ data: segment }, { status: httpStatus.CREATED })
}

export const updateSegment = async (
  req: NextRequest,
  { params }: { params: Promise<{ segmentId: string }> },
): Promise<NextResponse<APIResponse>> => {
  const user = authenticateHeaders(req.headers)
  const { segmentId } = await params

  const body = await req.json()
  const parsedBody = SegmentUpdateDtoSchema.parse(body)

  const segmentsService = SegmentsService.new(user)
  const segment = await segmentsService.update(segmentId, parsedBody)

  return NextResponse.json({ data: segment })
}

export const deleteSegment = async (
  req: NextRequest,
  { params }: { params: Promise<{ segmentId: string }> },
): Promise<NextResponse<APIResponse>> => {
  const user = authenticateHeaders(req.headers)
  const { segmentId } = await params

  const segmentsService = SegmentsService.new(user)
  const segment = await segmentsService.delete(segmentId)

  return NextResponse.json({ data: segment })
}
