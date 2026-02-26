import z from 'zod'

export enum MediaFolders {
  EDITOR = 'editor',
  LIBRARY = 'library',
  BANNER = 'banner',
}

export const MediaFolderSchema = z.enum([MediaFolders.EDITOR, MediaFolders.LIBRARY, MediaFolders.BANNER])

export const DEFAULT_BANNER_IMAGE_PATH = 'common/Default.png'

export const MEDIA_QUERY_KEY = 'media'
