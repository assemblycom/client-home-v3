import type { ConditionSchema } from '@segments/lib/conditions/types'
import type z from 'zod'

export type Condition = z.infer<typeof ConditionSchema>
