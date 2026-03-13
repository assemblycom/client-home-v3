import { Icon } from '@assembly-js/design-system'
import { useCallback, useState } from 'react'

interface BannerUploadDropzoneProps {
  isUploading?: boolean
  onFileSelect: (file: File) => void
  onClickUpload: () => void
}

export const BannerUploadDropzone = ({ isUploading, onFileSelect, onClickUpload }: BannerUploadDropzoneProps) => {
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file?.type.startsWith('image/')) onFileSelect(file)
    },
    [onFileSelect],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  return (
    <button
      type="button"
      onClick={onClickUpload}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      disabled={isUploading}
      className={`flex w-full cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed py-10 transition-colors ${isDragging ? 'border-gray-400 bg-gray-100' : 'border-gray-200 bg-gray-50'}`}
    >
      <Icon icon="Upload" width={24} height={24} className="text-gray-300" />
      <span className="font-normal text-sm text-text-primary"> Click to upload or drag and drop </span>
      <span className="text-text-secondary text-xs">1500 x 1600 recommended size</span>
    </button>
  )
}
