import 'server-only'

import { media } from '@media/lib/media.schema'
import { createSelectSchema } from 'drizzle-zod'

export const Media = createSelectSchema(media)
