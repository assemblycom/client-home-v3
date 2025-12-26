import type z from 'zod'
import type { ActionsSchema } from './types'

export type Actions = z.infer<typeof ActionsSchema>
