import z from 'zod'

export const UsersDtoSchema = z.object({
  id: z.uuid(),
  firstName: z.string(),
  lastName: z.string().optional(),
  email: z.email(),
  customFields: z.record(z.string(), z.any()).optional(),

  company: z
    .object({
      id: z.uuid(),
      name: z.string(),
      customFields: z.record(z.string(), z.any()).optional(),
    })
    .nullable(),
})

export type UsersDto = z.infer<typeof UsersDtoSchema>
