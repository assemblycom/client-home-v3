import z from 'zod'

export const ClientsDtoSchema = z.object({
  id: z.uuid(),
  firstName: z.string(),
  lastName: z.string().optional(),
  email: z.string(),
  customFields: z.record(z.string(), z.any()).nullish(),
  companyId: z.uuid().optional(),
  avatarSrc: z.string().optional(),
  avatarFallbackColor: z.string().optional(),
})

export const CompaniesDtoSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  customFields: z.record(z.string(), z.any()).nullish(),
  avatarSrc: z.string().optional(),
  avatarFallbackColor: z.string().optional(),
})

export type ClientsDto = z.infer<typeof ClientsDtoSchema>
export type CompaniesDto = z.infer<typeof CompaniesDtoSchema>

export const UsersDtoSchema = z.object({
  clients: ClientsDtoSchema.array(),
  companies: CompaniesDtoSchema.array(),
})
export type UsersDto = z.infer<typeof UsersDtoSchema>

export const ClientContextDtoSchema = z.object({
  client: ClientsDtoSchema,
  company: CompaniesDtoSchema.nullable(),
})
export type ClientContextDto = z.infer<typeof ClientContextDtoSchema>
