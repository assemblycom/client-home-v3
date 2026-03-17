import { authenticateHeaders } from '@auth/lib/authenticate'
import MediaService from '@media/lib/media.service'
import { CreateMediaRequestDtoSchema } from '@media/media.dto'
import httpStatus from 'http-status'
import { type NextRequest, NextResponse } from 'next/server'
import type { APIResponse } from '@/app/types'
import APIError from '@/errors/api.error'

/**
 * Retrieves banner images for the current workspace
 */
export const getBannerImages = async (req: NextRequest): Promise<NextResponse<APIResponse>> => {
  const user = authenticateHeaders(req.headers)

  const mediaService = MediaService.new(user)
  const bannerImages = await mediaService.getBannerImages()

  return NextResponse.json({
    data: bannerImages,
  })
}

export const insertBannerImage = async (req: NextRequest): Promise<NextResponse<APIResponse>> => {
  const user = authenticateHeaders(req.headers)
  const body = await req.json()
  const parsedBody = CreateMediaRequestDtoSchema.parse(body)
  const mediaService = MediaService.new(user)
  const bannerImage = await mediaService.createMediaEntry(parsedBody)
  return NextResponse.json({
    data: bannerImage,
  })
}

export const deleteBannerImage = async (req: NextRequest): Promise<NextResponse<APIResponse>> => {
  const user = authenticateHeaders(req.headers)
  const mediaId = req.nextUrl.searchParams.get('mediaId')
  if (!mediaId) {
    throw new APIError('mediaId is required', httpStatus.BAD_REQUEST)
  }
  const mediaService = MediaService.new(user)
  await mediaService.deleteBannerImage(mediaId)
  return NextResponse.json({ data: null })
}
