import type z from 'zod'
import { ActionsCreateSchema } from '@/features/settings/lib/actions/types'
import { SettingsCreateSchema } from '@/features/settings/lib/types'

export const UpdateSettingsWithActionDto = SettingsCreateSchema.partial()
  .superRefine((val, ctx) => {
    if (val.content === '') {
      ctx.addIssue({
        code: 'custom',
        message: 'Content should not be empty string',
        path: ['content'],
      })
    }

    if (val.backgroundColor && !/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val.backgroundColor)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Background color should be a valid hex color',
        path: ['backgroundColor'],
      })
    }
  })
  .safeExtend({
    actions: ActionsCreateSchema.omit({ settingsId: true }).optional(),
  })

export type UpdateSettingsWithActionDto = z.infer<typeof UpdateSettingsWithActionDto>
