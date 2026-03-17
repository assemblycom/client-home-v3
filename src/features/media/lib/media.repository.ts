import 'server-only'

import type { MediaType } from '@media/lib/media.entity'
import { media } from '@media/lib/media.schema'
import { BANNER } from '@media/lib/types'
import type { CreateMediaRequestDto } from '@media/media.dto'
import { and, eq, or } from 'drizzle-orm'
import type { BaseRepository } from '@/lib/core/base.repository'
import BaseDrizzleRepository from '@/lib/core/base-drizzle.repository'

export interface MediaRepository extends BaseRepository {
  getBannerImages(workspaceId: string): Promise<MediaType[]>
  getById(id: string): Promise<MediaType | null>
  getByPath(path: string): Promise<MediaType | null>
  createMedia(media: CreateMediaRequestDto, workspaceId: string, createdById: string): Promise<MediaType>
  deleteMedia(id: string): Promise<MediaType>
}

export default class MediaDrizzleRepository extends BaseDrizzleRepository implements MediaRepository {
  async getBannerImages(workspaceId: string): Promise<MediaType[]> {
    const result = await this.db
      .select()
      .from(media)
      .where(and(or(eq(media.workspaceId, workspaceId), eq(media.workspaceId, '*')), eq(media.mediaType, BANNER)))
    return result
  }

  async getById(id: string): Promise<MediaType | null> {
    const [result] = await this.db.select().from(media).where(eq(media.id, id)).limit(1)
    return result || null
  }

  async getByPath(path: string): Promise<MediaType | null> {
    const [result] = await this.db.select().from(media).where(eq(media.path, path)).limit(1)
    return result || null
  }

  async createMedia(payload: CreateMediaRequestDto, workspaceId: string, createdById: string) {
    const [result] = await this.db
      .insert(media)
      .values({
        workspaceId,
        createdById,
        name: payload.name,
        path: payload.path,
        type: payload.type,
        size: payload.size,
        mediaType: payload.mediaType,
      })
      .returning()
    return result
  }

  async deleteMedia(id: string): Promise<MediaType> {
    const [deleted] = await this.db.delete(media).where(eq(media.id, id)).returning()
    return deleted
  }
}
