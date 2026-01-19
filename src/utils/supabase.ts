import env from '@/config/env'

export const getFileNameWithTimestamp = (fileName: string) => {
  const extensionIdx = fileName.lastIndexOf('.')
  return `${fileName.slice(0, extensionIdx)}_${Date.now()}${fileName.slice(extensionIdx)}`
}

export const removeBucketNameFromPath = (filePath: string) => {
  return filePath.replace(`${env.SUPABASE_BUCKET_NAME}/`, '')
}
