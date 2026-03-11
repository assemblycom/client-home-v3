import type { SegmentSchema } from '@segments/lib/segments/types'
import type z from 'zod'

export type Segment = z.infer<typeof SegmentSchema>
