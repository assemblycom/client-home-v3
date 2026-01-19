import 'server-only'

import { authenticateHeaders } from '@auth/lib/authenticate'
import MediaService from '@media/lib/media.service'
import { MediaUploadRequestDtoSchema } from '@media/media.dto'
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

export const getUploadUrl = async (req: NextRequest): Promise<NextResponse<APIResponse>> => {
  const user = await authenticateHeaders(req.headers)
  const { fileName } = MediaUploadRequestDtoSchema.parse(await req.json())

  const mediaService = MediaService.new(user)
  const uploadInfo = await mediaService.getSignedUploadUrl(fileName)

  return NextResponse.json({ data: uploadInfo })
}
