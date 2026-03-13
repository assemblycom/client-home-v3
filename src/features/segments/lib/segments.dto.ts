import { ConditionCreateSchema, ConditionSchema } from '@segments/lib/conditions/types'
import { SegmentCreateSchema, SegmentSchema } from '@segments/lib/segments/types'
import { SettingsSchema } from '@settings/lib/types'
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

const ConditionSummarySchema = ConditionSchema.pick({
  id: true,
  compareValue: true,
})

export const FormattedSegmentDataSchema = SegmentSchema.pick({
  name: true,
  workspaceId: true,
}).extend({
  id: z.uuid().optional(),
  settingId: SettingsSchema.shape.id,
  color: z.string(),
  conditions: z.array(ConditionSummarySchema),
})
export type FormattedSegmentData = z.infer<typeof FormattedSegmentDataSchema>

export const SegmentStatsSettingsSchema = FormattedSegmentDataSchema.extend({
  clientsCount: z.number(),
})
export type SegmentStatsSettings = z.infer<typeof SegmentStatsSettingsSchema>

export const SegmentConfigUpsertDtoSchema = z.object({
  customField: z.string(),
  customFieldId: z.string(),
  entityType: z.enum(['client', 'company']),
})
export type SegmentConfigUpsertDto = z.infer<typeof SegmentConfigUpsertDtoSchema>

export const SegmentConfigResponseSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  customField: z.string(),
  customFieldId: z.string(),
  entityType: z.enum(['client', 'company']),
})
export type SegmentConfigResponse = z.infer<typeof SegmentConfigResponseSchema>

export const SegmentStatsResponseDtoSchema = z.object({
  totalClients: z.number(),
  segmentConfig: SegmentConfigResponseSchema.nullable(),
  segments: z.array(SegmentStatsSettingsSchema),
})
export type SegmentStatsResponseDto = z.infer<typeof SegmentStatsResponseDtoSchema>
