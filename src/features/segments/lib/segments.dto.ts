import { ConditionCreateSchema } from '@segments/lib/conditions/types'
import { SegmentCreateSchema } from '@segments/lib/segments/types'
import z from 'zod'

export const SegmentCreateDtoSchema = SegmentCreateSchema.extend({
  conditions: z.array(ConditionCreateSchema).min(1, 'At least one condition is required'),
})
export type SegmentCreateDto = z.infer<typeof SegmentCreateDtoSchema>
