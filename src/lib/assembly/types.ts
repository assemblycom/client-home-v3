import { z } from 'zod'

// Schema for hex color codes
export const HexColorSchema = z.string().refine((val) => /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(val), {
  message: 'Invalid hex color code',
})

// List arguments supported by Assembly API
export type AssemblyListArgs = {
  limit?: number
  nextToken?: string
}

// Schema for decrypted Assembly tokens
export const TokenSchema = z
  .object({
    internalUserId: z.uuid().optional(),
    clientId: z.uuid().optional(),
    companyId: z.uuid().optional(),
    workspaceId: z.string().min(1),
  })
  .refine((val) => val.internalUserId || (val.clientId && val.companyId), {
    message: 'Token must contain either internalUserId, or clientId and companyId',
  })
export type Token = z.infer<typeof TokenSchema>

// Response schema for `/workspace` endpoint
export const WorkspaceResponseSchema = z.object({
  id: z.string(),
  brandName: z.string().optional(),
  labels: z
    .object({
      individualTerm: z.string().optional(),
      individualTermPlural: z.string().optional(),
      groupTerm: z.string().optional(),
      groupTermPlural: z.string().optional(),
    })
    .optional(),
})
export type WorkspaceResponse = z.infer<typeof WorkspaceResponseSchema>

// Response schema for `/clients/{clientId}` endpoint
export const ClientResponseSchema = z.object({
  id: z.string(),
  givenName: z.string(),
  familyName: z.string(),
  email: z.string(),
  companyIds: z.array(z.uuid()).optional(),
  status: z.string(),
  avatarImageUrl: z.string().nullable(),
  fallbackColor: z.string().nullish(),
  createdAt: z.iso.datetime(),
})
export type ClientResponse = z.infer<typeof ClientResponseSchema>

// Response schema for `/clients` endpoint
export const ClientsResponseSchema = z.object({
  data: z.array(ClientResponseSchema).nullable(),
})
export type ClientsResponse = z.infer<typeof ClientsResponseSchema>

// Response schema for `/companies/{companyId}` endpoint
export const CompanyResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  iconImageUrl: z.string().nullable(),
  fallbackColor: z.string().nullish(),
  isPlaceholder: z.boolean(),
  customFields: z
    .object({
      email: z.string().optional(),
    })
    .optional(),
  createdAt: z.iso.datetime(),
})
export type CompanyResponse = z.infer<typeof CompanyResponseSchema>

// Response schema for `/companies` endpoint
export const CompaniesResponseSchema = z.object({
  data: z.array(CompanyResponseSchema).nullable(),
})
export type CompaniesResponse = z.infer<typeof CompaniesResponseSchema>

// Request schema for `/company` POST endpoint
export const CompanyCreateRequestSchema = z.object({
  name: z.string(),
  iconImageUrl: z.string().optional(),
  fallbackColor: HexColorSchema.optional(),
})
export type CompanyCreateRequest = z.infer<typeof CompanyCreateRequestSchema>

// Request schema for `/clients` POST endpoint
export const ClientCreateRequestSchema = z.object({
  givenName: z.string(),
  familyName: z.string(),
  email: z.email(),
  companyId: z.uuid().optional(),
})
export type ClientCreateRequest = z.infer<typeof ClientCreateRequestSchema>

// Response schema for `/internal-users/{internalUserId}` endpoint
export const InternalUserResponseSchema = z.object({
  id: z.uuid(),
  givenName: z.string(),
  familyName: z.string(),
  email: z.union([z.email(), z.literal('')]), // Deleted IUs can be queried, but have no email
  avatarImageUrl: z.string().optional(),
  isClientAccessLimited: z.boolean().default(false),
  companyAccessList: z.array(z.string()).nullable(),
  fallbackColor: z.string().nullish(),
  createdAt: z.iso.datetime(),
})
export type InternalUser = z.infer<typeof InternalUserResponseSchema>

// Response schema for `/internal-users` endpoint
export const InternalUsersResponseSchema = z.object({
  data: z.array(InternalUserResponseSchema),
})
export type InternalUsersResponse = z.infer<typeof InternalUsersResponseSchema>
