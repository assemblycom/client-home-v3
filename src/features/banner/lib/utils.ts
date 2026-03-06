import { uploadFileToSupabase } from '@editor/client.utils'
import { MediaFolders } from '@media/constants'

export const getImageUrl = (path: string | undefined, token: string) => {
  return `/api/media/image?token=${token}&filePath=${path}`
}

export const handleBannerFileUpload = async (file: File, token: string) => {
  const { path } = await uploadFileToSupabase(file, token, MediaFolders.BANNER)

  return {
    path,
    name: file.name,
    type: file.type,
    size: file.size.toString(),
  }
}

export const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>, token: string) => {
  const file = e.target.files?.[0]
  if (!file) return

  return await handleBannerFileUpload(file, token)
}
