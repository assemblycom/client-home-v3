import { authenticateHeaders } from '@auth/lib/authenticate'
import MediaService from '@media/lib/media.service'
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

export const getCurrentBanner = async (req: NextRequest): Promise<NextResponse<APIResponse>> => {
  const user = authenticateHeaders(req.headers)

  const mediaService = MediaService.new(user)
  const bannerImages = await mediaService.getBannerImages()

  return NextResponse.json({
    data: bannerImages,
  })
}

export const getImage = async (req: NextRequest): Promise<NextResponse<APIResponse>> => {
  const user = authenticateHeaders(req.headers)
  const searchParams = req.nextUrl.searchParams
  console.info('HEREEEE', searchParams)
  const filePath = searchParams.get('filePath')

  if (!filePath) {
    throw new APIError('File path is required', httpStatus.BAD_REQUEST)
  }

  const mediaService = MediaService.new(user)
  const signedUrl = await mediaService.getSignedFileUrl(filePath)

  if (!signedUrl) {
    throw new APIError('SignedUrl not found', httpStatus.INTERNAL_SERVER_ERROR)
  }
  const imageResponse = await fetch(signedUrl)

  if (!imageResponse.ok) {
    throw new APIError('Failed to fetch image', httpStatus.INTERNAL_SERVER_ERROR)
  }

  const headers: ResponseInit['headers'] = {
    'Content-Type': imageResponse.headers.get('Content-Type') || 'image/jpeg', // Set appropriate content type
    'Cache-Control': 'public, max-age=1864000, immutable', // Optional: Cache headers for performance
  }

  return new NextResponse(imageResponse.body, {
    headers,
  })
}
