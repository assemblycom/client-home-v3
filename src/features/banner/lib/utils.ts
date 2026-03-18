import { AssemblyBridge } from '@assembly-js/app-bridge'
import { uploadFileToSupabase } from '@editor/client.utils'
import { MediaFolders } from '@media/constants'

export const getImageUrl = (path: string | undefined) => {
  const token = AssemblyBridge.sessionToken.getCurrent()?.token ?? ''
  return `/api/media/image?token=${token}&filePath=${path}`
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
