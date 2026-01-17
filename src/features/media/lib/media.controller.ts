import 'server-only'

import { authenticateHeaders } from '@auth/lib/authenticate'
import MediaService from '@media/lib/media.service'
import { MediaUploadRequestDtoSchema } from '@media/media.dto'
import { type NextRequest, NextResponse } from 'next/server'
import type { APIResponse } from '@/app/types'

export const getUploadUrl = async (req: NextRequest): Promise<NextResponse<APIResponse>> => {
  const user = await authenticateHeaders(req.headers)
  const { fileName } = MediaUploadRequestDtoSchema.parse(await req.json())

  const mediaService = MediaService.new(user)
  const uploadInfo = await mediaService.getSignedUrl(fileName)

  return NextResponse.json({ data: uploadInfo })
}
