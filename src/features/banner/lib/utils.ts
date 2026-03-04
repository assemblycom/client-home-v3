import { uploadFileToSupabase } from '@editor/client.utils'
import { MediaFolders } from '@media/constants'

export const getImageUrl = (path: string | undefined, token: string) => {
  return `/api/media/image?token=${token}&filePath=${path}`
}

export const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>, token: string) => {
  const file = e.target.files?.[0]
  if (!file) return

  const { path } = await uploadFileToSupabase(file, token, MediaFolders.BANNER)
  const formatPath = path.startsWith('media/') ? path.substring(6) : path

  return {
    path: formatPath,
    name: file.name,
    type: file.type,
    size: file.size.toString(),
  }
}
