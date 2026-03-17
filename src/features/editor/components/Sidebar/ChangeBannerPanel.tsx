import { Button, Icon } from '@assembly-js/design-system'
import { useAuthStore } from '@auth/providers/auth.provider'
import { useBannerSettingsMutation } from '@settings/hooks/useBannerSettingsMutation'
import { useSettingsStore } from '@settings/providers/settings.provider'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Banner } from '@/features/banner'
import { BannerUploadDropzone } from '@/features/banner/components/BannerUploadDropzone'
import { useBannerMutation } from '@/features/banner/hooks/useBannerMutation'
import { useDeleteBannerMutation } from '@/features/banner/hooks/useDeleteBannerMutation'
import { getImageUrl, handleBannerFileUpload } from '@/features/banner/lib/utils'

interface ChangeBannerPanelProps {
  onBack: () => void
}

export const ChangeBannerPanel = ({ onBack }: ChangeBannerPanelProps) => {
  const bannerImages = useSettingsStore((store) => store?.bannerImages)
  const bannerId = useSettingsStore((store) => store?.bannerImageId)
  const token = useAuthStore((store) => store.token)
  const setBannerImage = useSettingsStore((s) => s.setBannerImageId)
  const updateBannerMutation = useBannerSettingsMutation()
  const createBannerMutation = useBannerMutation()
  const deleteBannerMutation = useDeleteBannerMutation()

  const [selectedImage, setSelectedImage] = useState(bannerImages?.find((item) => item.id === bannerId))
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    setSelectedImage(bannerImages?.find((item) => item.id === bannerId))
  }, [bannerId, bannerImages])

  const handleRemoveBanner = () => {
    setSelectedImage(undefined)
    updateBannerMutation.mutate({ bannerImageId: null, bannerPositionX: 50, bannerPositionY: 50 })
  }

  const handleSaveChanges = () => {
    if (selectedImage?.id) {
      updateBannerMutation.mutate({ bannerImageId: selectedImage.id, bannerPositionX: 50, bannerPositionY: 50 })
    }
  }

  const uploadFile = useCallback(
    (file: File) => {
      setIsUploading(true)
      handleBannerFileUpload(file, token)
        .then((mediaMetadata) => {
          createBannerMutation.mutate(
            {
              ...mediaMetadata,
              mediaType: 'banner',
            },
            {
              onSuccess: (data) => {
                const uploaded = data.data
                setBannerImage(uploaded.id)
                setSelectedImage({ id: uploaded.id, path: uploaded.path, workspaceId: uploaded.workspaceId })
                updateBannerMutation.mutate({ bannerImageId: uploaded.id, bannerPositionX: 50, bannerPositionY: 50 })
              },
            },
          )
        })
        .catch((error) => {
          console.error('Failed to upload banner:', error)
        })
        .finally(() => {
          setIsUploading(false)
        })
    },
    [token, createBannerMutation, setBannerImage, updateBannerMutation],
  )

  const onBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
  }

  const handleCancelChanges = () => {
    setSelectedImage(bannerImages?.find((item) => item.id === bannerId))
  }

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  const currentBannerPath = selectedImage?.path ?? ''
  const hasBanner = !!selectedImage

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 w-full shrink-0 items-center px-6 py-3">
        <button type="button" onClick={onBack} className="flex cursor-pointer items-center gap-1.5 py-[3px]">
          <Icon icon="ArrowLeft" className="size-3.25" />
          <span className="font-normal text-[11px] text-text-primary leading-[18px]">Back</span>
        </button>
      </div>
      <div className="flex flex-col gap-y-[4px] border-border-gray border-b px-6 pt-4 pb-6">
        <span className="font-normal text-[20px] text-text-primary leading-6">Change banner</span>
        <span className="text-[13px] text-text-primary leading-[21px]">
          Recommended image size is 1139 x 231 pixels. Text in images may appear cut off at smallest screen sizes.
        </span>
      </div>
      <div className="flex flex-col items-start gap-y-[32px] overflow-y-auto px-[27px] py-[21px]">
        <div className="flex flex-col items-start gap-y-[12px] self-stretch">
          <span className="text-[12px] text-text-secondary leading-[20px]">Current banner</span>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={onBannerUpload} className="hidden" />
          {hasBanner ? (
            <>
              <div className="group/banner relative w-full">
                <Banner src={getImageUrl(currentBannerPath, token)} alt="banner" />
                <button
                  type="button"
                  onClick={handleRemoveBanner}
                  className="absolute top-2 right-2 z-10 cursor-pointer rounded-[4px] bg-white p-[5px] opacity-0 shadow-sm transition-opacity group-hover/banner:opacity-100"
                >
                  <Icon icon="Trash" width={16} height={16} />
                </button>
              </div>
              <Button
                label={isUploading ? 'Uploading...' : 'Upload image'}
                variant="secondary"
                onClick={openFilePicker}
                className="w-full"
                disabled={isUploading}
              />
            </>
          ) : (
            <>
              <BannerUploadDropzone
                isUploading={isUploading}
                onFileSelect={uploadFile}
                onClickUpload={openFilePicker}
              />
              <Button
                label={isUploading ? 'Uploading...' : 'Upload image'}
                variant="secondary"
                onClick={openFilePicker}
                className="w-full"
                disabled={isUploading}
              />
            </>
          )}
        </div>
        <div className="flex flex-col items-start gap-y-[12px] self-stretch">
          <span className="text-[12px] text-text-secondary leading-[20px]">Image library</span>
          {bannerImages?.map((banner) => (
            <div key={banner.id} className="group/library relative w-full">
              <button
                onClick={() => setSelectedImage(banner)}
                className="block w-full cursor-pointer border-none bg-transparent p-0"
                type="button"
              >
                <Banner src={getImageUrl(banner.path, token)} isSelected={selectedImage?.id === banner?.id} />
              </button>
              {banner.workspaceId !== '*' && selectedImage?.id !== banner.id && (
                <button
                  type="button"
                  onClick={() => deleteBannerMutation.mutate(banner.id)}
                  className="absolute top-2 right-2 z-10 cursor-pointer rounded-[4px] bg-white p-[5px] opacity-0 shadow-sm transition-opacity group-hover/library:opacity-100"
                >
                  <Icon icon="Trash" width={16} height={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      {selectedImage?.id !== bannerId && (
        <div className="mt-auto flex flex-row items-start gap-[10px] border-border-gray border-t px-6 py-3">
          <Button label="Change" variant="primary" onClick={handleSaveChanges} />
          <Button label="Cancel" variant="secondary" onClick={handleCancelChanges} />
        </div>
      )}
    </div>
  )
}
