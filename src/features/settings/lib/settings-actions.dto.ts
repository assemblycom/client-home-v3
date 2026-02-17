import { ActionsCreateSchema, ActionsUpdateSchema } from '@settings/lib/actions/types'
import { SettingsSchema, SettingsUpdateSchema } from '@settings/lib/types'
import z from 'zod'

export const SettingsResponseDtoSchema = SettingsSchema.extend({
  actions: ActionsCreateSchema.omit({ settingsId: true }),
  bannerUrl: z.string().nullable().optional(),
})

export type SettingsResponseDto = z.infer<typeof SettingsResponseDtoSchema>

export const SettingsUpdateDtoSchema = SettingsUpdateSchema.extend({
  actions: ActionsUpdateSchema.omit({ settingsId: true }).optional(),
})

export type SettingsUpdateDto = z.infer<typeof SettingsUpdateDtoSchema>
