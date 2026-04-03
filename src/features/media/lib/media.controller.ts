import 'server-only'

import { authenticateHeaders } from '@auth/lib/authenticate'
import { MediaFolderSchema, type MediaFolders } from '@media/constants'
import MediaService from '@media/lib/media.service'
import { CreateMediaRequestDtoSchema, MediaUploadRequestDtoSchema } from '@media/media.dto'
import httpStatus from 'http-status'
import { type NextRequest, NextResponse } from 'next/server'
import type { APIResponse } from '@/app/types'
import APIError from '@/errors/api.error'
import { removeBucketNameFromPath } from '@/utils/supabase'

export const getSignedUrl = async (req: NextRequest): Promise<NextResponse<APIResponse>> => {
  const user = await authenticateHeaders(req.headers)
  const filePath = req.nextUrl.searchParams.get('filePath')

  if (!filePath) {
    throw new APIError('File path is required', httpStatus.BAD_REQUEST)
  }

  const mediaService = MediaService.new(user)
  const signedUrl = await mediaService.getSignedFileUrl(removeBucketNameFromPath(filePath))

  return NextResponse.json({ data: { signedUrl } })
}

export const createMedia = async (req: NextRequest): Promise<NextResponse<APIResponse>> => {
  const user = authenticateHeaders(req.headers)
  const body = await req.json()
  const parsedBody = CreateMediaRequestDtoSchema.parse(body)
  const mediaService = MediaService.new(user)
  const media = await mediaService.createMediaEntry(parsedBody)
  return NextResponse.json({ data: media })
}

export const getUploadUrl = async (req: NextRequest): Promise<NextResponse<APIResponse>> => {
  const user = await authenticateHeaders(req.headers)
  const { fileName } = MediaUploadRequestDtoSchema.parse(await req.json())
  const rawMediaFolder = req.nextUrl.searchParams.get('mediafolder')
  const parsed = MediaFolderSchema.safeParse(rawMediaFolder)

  const mediaFolder: MediaFolders | undefined = parsed.success ? parsed.data : undefined

  const mediaService = MediaService.new(user)
  const uploadInfo = await mediaService.getSignedUploadUrl(fileName, mediaFolder)

  return NextResponse.json({ data: uploadInfo })
}

export const getImage = async (req: NextRequest): Promise<NextResponse<APIResponse>> => {
  const user = await authenticateHeaders(req.headers)
  const searchParams = req.nextUrl.searchParams
  const filePath = searchParams.get('filePath')

  if (!filePath) {
    throw new APIError('File path is required', httpStatus.BAD_REQUEST)
  }

  const mediaService = MediaService.new(user)

  let signedUrl: string | null
  try {
    signedUrl = await mediaService.getSignedFileUrl(removeBucketNameFromPath(filePath))
  } catch {
    throw new APIError('Image not found', httpStatus.NOT_FOUND)
  }

  if (!signedUrl) {
    throw new APIError('Image not found', httpStatus.NOT_FOUND)
  }

  const imageResponse = await fetch(signedUrl)

  if (!imageResponse.ok) {
    throw new APIError('Image not found', httpStatus.NOT_FOUND)
  }

  const imageBuffer = await imageResponse.arrayBuffer()

  const headers: ResponseInit['headers'] = {
    'Content-Type': imageResponse.headers.get('Content-Type') || 'image/jpeg',
    'Cache-Control': 'public, max-age=1864000, immutable',
  }

  return new NextResponse(imageBuffer, {
    headers,
  })
}
