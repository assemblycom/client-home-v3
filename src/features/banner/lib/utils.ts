import { uploadFileToSupabase } from '@editor/client.utils'
import { MediaFolders } from '@media/constants'

export const getImageUrl = (path: string | undefined) => {
  if (!path) {
    console.warn('[getImageUrl] called with undefined path')
    return undefined
  }
  return `/api/media/image?filePath=${encodeURIComponent(path)}`
}

export const handleBannerFileUpload = async (file: File) => {
  const { path } = await uploadFileToSupabase(file, MediaFolders.BANNER)

  return {
    path,
    name: file.name,
    type: file.type,
    size: file.size.toString(),
  }
}

export const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

  return await handleBannerFileUpload(file)
}
