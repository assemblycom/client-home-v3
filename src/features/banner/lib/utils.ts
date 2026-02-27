export const getImageUrl = (path: string | undefined, token: string) => {
  return `/api/media/image?token=${token}&filePath=${path}`
}
