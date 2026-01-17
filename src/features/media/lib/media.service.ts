import 'server-only'

import AssemblyClient from '@assembly/assembly-client'
import type { User } from '@auth/lib/user.entity'
import { MediaFolders } from '@media/constants'
import type { MediaRepository } from '@media/lib/media.repository'
import MediaDrizzleRepository from '@media/lib/media.repository'
import type { MediaUploadResponseDto } from '@media/media.dto'
import env from '@/config/env'
import db from '@/db'
import BaseService from '@/lib/core/base.service'
import SupabaseClient from '@/lib/supabase/supabase-server-client'

export default class MediaService extends BaseService {
  constructor(
    protected readonly user: User,
    protected readonly assembly: AssemblyClient,
    protected readonly repository: MediaRepository,
  ) {
    super(user, assembly)
  }

  /**
   * Wire dependencies for service used by app
   */
  static new(user: User): MediaService {
    const assembly = new AssemblyClient(user.token)
    const repository = new MediaDrizzleRepository(db)
    return new MediaService(user, assembly, repository)
  }

  async getSignedUrl(fileName: string, mode: MediaFolders = MediaFolders.EDITOR): Promise<MediaUploadResponseDto> {
    const supabase = new SupabaseClient()
    const path = this.getFileUploadPath(fileName, mode)

    const signedUrlInfo = await supabase.getSignedUploadUrl(path)
    return signedUrlInfo
  }

  private getFileUploadPath(fileName: string, mode: MediaFolders): string {
    return `${env.SUPABASE_BUCKET_NAME}/${this.user.workspaceId}/${mode}/${fileName}_${Date.now()}`
  }
}
