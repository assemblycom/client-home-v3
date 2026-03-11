import { ConditionCreateSchema, ConditionSchema } from '@segments/lib/conditions/types'
import { SegmentCreateSchema, SegmentSchema } from '@segments/lib/segments/types'
import z from 'zod'

export const SegmentCreateDtoSchema = SegmentCreateSchema.extend({
  conditions: z.array(ConditionCreateSchema).min(1, 'At least one condition is required'),
})
export type SegmentCreateDto = z.infer<typeof SegmentCreateDtoSchema>

export const SegmentResponseDtoSchema = SegmentSchema.extend({
  conditions: z.array(ConditionSchema),
})
export type SegmentResponseDto = z.infer<typeof SegmentResponseDtoSchema>
