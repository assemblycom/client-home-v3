import type { SettingsSchema } from '@settings/lib/types'
import type z from 'zod'

/**
 * Settings entity for a workspace
 */
export type Settings = z.infer<typeof SettingsSchema>
