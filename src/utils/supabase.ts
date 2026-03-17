import env from '@/config/env'

const normalizeFileName = (fileName: string) =>
  fileName.replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, ' ').trim()

export const getFileNameWithTimestamp = (fileName: string) => {
  const normalized = normalizeFileName(fileName)
  const extensionIdx = normalized.lastIndexOf('.')
  return `${normalized.slice(0, extensionIdx)}_${Date.now()}${normalized.slice(extensionIdx)}`
}

export const removeBucketNameFromPath = (filePath: string) => {
  return filePath.replace(`${env.SUPABASE_BUCKET_NAME}/`, '')
}
