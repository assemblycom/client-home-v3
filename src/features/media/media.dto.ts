import z from 'zod'

export const MediaUploadRequestDtoSchema = z.object({
  fileName: z.string().min(1),
})
export type MediaUploadRequestDto = z.infer<typeof MediaUploadRequestDtoSchema>

export const MediaUploadResponseDtoSchema = z.object({
  signedUrl: z.string().min(1),
  token: z.string().min(1),
  path: z.string().min(1),
})
export type MediaUploadResponseDto = z.infer<typeof MediaUploadResponseDtoSchema>
