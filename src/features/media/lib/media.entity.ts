import 'server-only'

import { media } from '@media/lib/media.schema'
import { createSelectSchema } from 'drizzle-zod'
import type z from 'zod'

export const Media = createSelectSchema(media)

export type MediaType = z.infer<typeof Media>
