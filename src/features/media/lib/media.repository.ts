import 'server-only'

import type { MediaType } from '@media/lib/media.entity'
import { media } from '@media/lib/media.schema'
import { eq, or } from 'drizzle-orm'
import type { BaseRepository } from '@/lib/core/base.repository'
import BaseDrizzleRepository from '@/lib/core/base-drizzle.repository'

export interface MediaRepository extends BaseRepository {
  getBannerImages(workspaceId: string): Promise<MediaType[]>
  getByPath(path: string): Promise<MediaType | null>
}

export default class MediaDrizzleRepository extends BaseDrizzleRepository implements MediaRepository {
  async getBannerImages(workspaceId: string): Promise<MediaType[]> {
    const result = await this.db
      .select()
      .from(media)
      .where(or(eq(media.workspaceId, workspaceId), eq(media.workspaceId, '*')))
    return result
  }

  async getByPath(path: string): Promise<MediaType | null> {
    const [result] = await this.db.select().from(media).where(eq(media.path, path)).limit(1)
    return result || null
  }
}
