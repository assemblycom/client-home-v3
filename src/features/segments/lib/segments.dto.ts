import { ConditionCreateSchema, ConditionSchema } from '@segments/lib/conditions/types'
import { SegmentCreateSchema, SegmentSchema } from '@segments/lib/segments/types'
import z from 'zod'

export const SegmentCreateDtoSchema = SegmentCreateSchema.extend({
  conditions: z.array(ConditionCreateSchema).min(1, 'At least one condition is required'),
})
export type SegmentCreateDto = z.infer<typeof SegmentCreateDtoSchema>

export const SegmentUpdateDtoSchema = z.object({
  name: z.string().max(255).optional(),
  conditions: z.array(ConditionCreateSchema).min(1, 'At least one condition is required').optional(),
})
export type SegmentUpdateDto = z.infer<typeof SegmentUpdateDtoSchema>

export const SegmentResponseDtoSchema = SegmentSchema.extend({
  conditions: z.array(ConditionSchema),
})
export type SegmentResponseDto = z.infer<typeof SegmentResponseDtoSchema>

export const SegmentStatSchema = z.object({
  name: z.string(),
  color: z.string(),
  count: z.number(),
})

export const SegmentStatsResponseDtoSchema = z.object({
  totalClients: z.number(),
  stats: z.array(SegmentStatSchema),
})
export type SegmentStatsResponseDto = z.infer<typeof SegmentStatsResponseDtoSchema>
