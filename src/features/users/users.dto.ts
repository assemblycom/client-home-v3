import z from 'zod'

export const UsersDtoSchema = z.object({
  id: z.uuid(),
  firstName: z.string(),
  lastName: z.string().optional(),
  email: z.email(),
  customFields: z.object().optional(),

  company: z
    .object({
      name: z.string(),
      customFields: z.object().optional(),
    })
    .optional(),
})

export type UsersDto = z.infer<typeof UsersDtoSchema>
