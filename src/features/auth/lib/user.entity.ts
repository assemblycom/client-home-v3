import { z } from 'zod'

export const UserSchema = z
  .object({
    token: z.string(),
    internalUserId: z.string().optional(),
    clientId: z.string().optional(),
    companyId: z.string().optional(),
    workspaceId: z.string(),
  })
  .refine((val) => val.internalUserId || (val.clientId && val.companyId), {
    message: 'User must contain either internalUserId, or clientId and companyId',
  })

export type User = z.infer<typeof UserSchema>
