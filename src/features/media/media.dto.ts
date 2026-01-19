import z from 'zod'

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
