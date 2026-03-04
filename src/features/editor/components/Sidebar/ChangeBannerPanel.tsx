import { useAuthStore } from '@auth/providers/auth.provider'
import { useSettingsMutation } from '@settings/hooks/useSettingsMutation'
import { useSettingsStore } from '@settings/providers/settings.provider'
import { Button, Icon } from 'copilot-design-system'
import { useCallback, useRef, useState } from 'react'
import { Banner, BannerSkeleton } from '@/features/banner'
import { useBannerMutation } from '@/features/banner/hooks/useBannerMutation'
import { getImageUrl, handleBannerUpload } from '@/features/banner/lib/utils'

interface ChangeBannerPanelProps {
  onBack: () => void
}

export const ChangeBannerPanel = ({ onBack }: ChangeBannerPanelProps) => {
  const bannerImages = useSettingsStore((store) => store?.bannerImages)
  const bannerId = useSettingsStore((store) => store?.bannerImageId)
  const token = useAuthStore((store) => store.token)
  const setBannerImage = useSettingsStore((s) => s.setBannerImageId)
  const updateSettingsMutation = useSettingsMutation()
  const createBannerMutation = useBannerMutation()

  const [selectedImage, setSelectedImage] = useState(bannerImages?.find((item) => item.id === bannerId))
  const [isUploading, setIsUploading] = useState(false)

  const LOAD_THRESHOLD = 15
  const loadedCountRef = useRef(0)
  const [libraryReady, setLibraryReady] = useState(false)
  const onLibraryImageLoad = useCallback(() => {
    loadedCountRef.current += 1
    if (loadedCountRef.current >= Math.min(LOAD_THRESHOLD, bannerImages?.length ?? 0)) {
      setLibraryReady(true)
    }
  }, [bannerImages?.length])

  const handleSaveChanges = () => {
    if (selectedImage?.id) {
      setBannerImage(selectedImage.id)
      updateSettingsMutation.mutate({ bannerImageId: selectedImage.id })
    }
  }

  const onBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsUploading(true)
    try {
      const mediaMetadata = await handleBannerUpload(e, token)
      if (mediaMetadata) {
        createBannerMutation.mutate({
          ...mediaMetadata,
          mediaType: 'banner',
        })
      }
    } catch (error) {
      console.error('Failed to upload banner:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleCancelChanges = () => {
    setSelectedImage(bannerImages?.find((item) => item.id === bannerId))
  }

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  const currentBannerPath = selectedImage?.path ?? ''

  return (
    <div className="flex h-full flex-col">
      <div className="flex-col items-start gap-y-[4px] self-stretch border-border-gray border-b px-4 pt-2 pb-6 pl-6">
        <button type="button" onClick={onBack} className="flex cursor-pointer items-center gap-1.5 py-[3px]">
          <Icon icon="ArrowLeft" className="size-3.25" />
          <span className="font-normal text-[11px] text-text-primary leading-[18px]">Back</span>
        </button>
        <div className="flex flex-col gap-y-[4px] py-1">
          <span className="font-normal text-[20px] text-text-primary leading-6">Change banner</span>
          <span className="text-[13px] text-text-primary leading-[21px]">
            Recommended image size is 1139 x 231 pixels. Text in images may appear cut off at smallest screen sizes.
          </span>
        </div>
      </div>
      <div className="flex flex-col items-start gap-y-[32px] overflow-y-auto px-[27px] py-[21px]">
        <div className="flex flex-col items-start gap-y-[12px] self-stretch">
          <span className="text-[12px] text-text-secondary leading-[20px]">Current Banner </span>
          <Banner src={getImageUrl(currentBannerPath, token)} alt="banner" />
          <input type="file" accept="image/*" ref={fileInputRef} onChange={onBannerUpload} className="hidden" />
          <Button
            label={isUploading ? 'Uploading...' : 'Upload image'}
            variant="secondary"
            onClick={openFilePicker}
            className="w-full"
            disabled={isUploading}
          />
        </div>
        <div className="flex flex-col items-start gap-y-[12px] self-stretch">
          <span className="text-[12px] text-text-secondary leading-[20px]">Image library </span>
          {bannerImages
            ? bannerImages.map((banner) => (
                <button
                  key={banner.id}
                  onClick={() => setSelectedImage(banner)}
                  className="block w-full cursor-pointer border-none bg-transparent p-0"
                  type="button"
                >
                  <Banner
                    src={getImageUrl(banner.path, token)}
                    isSelected={selectedImage?.id === banner?.id}
                    showSkeleton={!libraryReady}
                    onImageLoad={onLibraryImageLoad}
                  />
                </button>
              ))
            : Array.from({ length: 3 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders
                <BannerSkeleton key={i} />
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
