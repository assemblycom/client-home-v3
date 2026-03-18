import { authenticateHeaders } from '@auth/lib/authenticate'
import {
  SegmentConfigUpsertDtoSchema,
  SegmentCreateDtoSchema,
  SegmentUpdateDtoSchema,
} from '@segments/lib/segments.dto'
import SegmentsService from '@segments/lib/segments.service'
import httpStatus from 'http-status'
import { type NextRequest, NextResponse } from 'next/server'
import type { APIResponse } from '@/app/types'
import APIError from '@/errors/api.error'

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

export const upsertSegmentConfig = async (req: NextRequest): Promise<NextResponse<APIResponse>> => {
  const user = authenticateHeaders(req.headers)
  if (!user.internalUserId) {
    throw new APIError('Only internal users can configure segments', httpStatus.FORBIDDEN)
  }

  const body = await req.json()
  const parsedBody = SegmentConfigUpsertDtoSchema.parse(body)

  const segmentsService = SegmentsService.new(user)
  const config = await segmentsService.upsertSegmentConfig(parsedBody)

  return NextResponse.json({ data: config })
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

export const deleteAllSegments = async (req: NextRequest): Promise<NextResponse<APIResponse>> => {
  const user = authenticateHeaders(req.headers)
  if (!user.internalUserId) {
    throw new APIError('Only internal users can delete segments', httpStatus.FORBIDDEN)
  }

  const segmentsService = SegmentsService.new(user)
  const deleted = await segmentsService.deleteAll()

  return NextResponse.json({ data: deleted })
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
