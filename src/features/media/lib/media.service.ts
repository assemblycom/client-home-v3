import 'server-only'

import AssemblyClient from '@assembly/assembly-client'
import type { User } from '@auth/lib/user.entity'
import { MediaFolders } from '@media/constants'
import type { MediaRepository } from '@media/lib/media.repository'
import MediaDrizzleRepository from '@media/lib/media.repository'
import type { MediaSignedUrlResponseDto } from '@media/media.dto'
import httpStatus from 'http-status'
import db from '@/db'
import APIError from '@/errors/api.error'
import BaseService from '@/lib/core/base.service'
import SupabaseClient from '@/lib/supabase/supabase-server-client'
import { getFileNameWithTimestamp } from '@/utils/supabase'

export default class MediaService extends BaseService {
  constructor(
    protected readonly user: User,
    protected readonly assembly: AssemblyClient,
    protected readonly supabase: SupabaseClient,
    protected readonly repository: MediaRepository,
  ) {
    super(user, assembly)
  }

  /**
   * Wire dependencies for service used by app
   */
  static new(user: User): MediaService {
    const assembly = new AssemblyClient(user.token)
    const supabase = new SupabaseClient()
    const repository = new MediaDrizzleRepository(db)
    return new MediaService(user, assembly, supabase, repository)
  }

  async getSignedFileUrl(filePath: string): Promise<string> {
    const signedUrlInfo = await this.supabase.getSignedUrls([filePath])
    if (signedUrlInfo[0].error) {
      throw new APIError(signedUrlInfo[0].error, httpStatus.BAD_REQUEST)
    }
    return signedUrlInfo[0].signedUrl
  }

  async getSignedUploadUrl(
    fileName: string,
    mode: MediaFolders = MediaFolders.EDITOR,
  ): Promise<MediaSignedUrlResponseDto> {
    const path = this.getFileUploadPath(fileName, mode)

    const signedUrlInfo = await this.supabase.getSignedUploadUrl(path)
    return signedUrlInfo
  }

  private getFileUploadPath(fileName: string, mode: MediaFolders): string {
    const fileNameWithTimestamp = getFileNameWithTimestamp(fileName)
    return `${this.user.workspaceId}/${mode}/${fileNameWithTimestamp}`
  }
}
