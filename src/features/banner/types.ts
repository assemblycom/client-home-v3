import z from 'zod'

export const BannerImagesResponseSchema = z
  .object({
    id: z.string(),
    path: z.string(),
  })
  .array()

export type BannerImagesResponse = z.infer<typeof BannerImagesResponseSchema>
