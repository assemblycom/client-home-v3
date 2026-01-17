import 'server-only'

import type { BaseRepository } from '@/lib/core/base.repository'
import BaseDrizzleRepository from '@/lib/core/base-drizzle.repository'

export interface MediaRepository extends BaseRepository {}

export default class MediaDrizzleRepository extends BaseDrizzleRepository implements MediaRepository {}
