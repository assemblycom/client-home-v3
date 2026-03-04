import z from 'zod'
import { mediaTypeEnum } from './lib/media.schema'

export const MediaSignedFileUrlRequestDtoSchema = z.object({
  filePath: z.string().min(1),
})
export type MediaSignedFileUrlRequestDto = z.infer<typeof MediaSignedFileUrlRequestDtoSchema>

export const MediaUploadRequestDtoSchema = z.object({
  fileName: z.string().min(1),
})
export type MediaUploadRequestDto = z.infer<typeof MediaUploadRequestDtoSchema>

export const MediaSignedUrlResponseDtoSchema = z.object({
  signedUrl: z.string().min(1),
  token: z.string().min(1),
  path: z.string().min(1),
})
export type MediaSignedUrlResponseDto = z.infer<typeof MediaSignedUrlResponseDtoSchema>

export const CreateMediaRequestDtoSchema = z.object({
  path: z.string().min(1),
  name: z.string(),
  type: z.string(),
  size: z.string(),
  mediaType: z.enum(mediaTypeEnum.enumValues),
})
export type CreateMediaRequestDto = z.infer<typeof CreateMediaRequestDtoSchema>
