import { RegisteredActionLabelSchema } from '@assembly/types'
import z from 'zod'

// A Studio app install eligible for "Your Actions": active and with a complete registered action label.
export const ActionableInstallDtoSchema = z.object({
  installId: z.string(),
  appId: z.string(),
  displayName: z.string(),
  icon: z.string().nullable(),
  actionLabel: RegisteredActionLabelSchema,
})
export type ActionableInstallDto = z.infer<typeof ActionableInstallDtoSchema>

export const ActionableInstallsDtoSchema = z.array(ActionableInstallDtoSchema)
export type ActionableInstallsDto = z.infer<typeof ActionableInstallsDtoSchema>
