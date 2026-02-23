import { useSettingsStore } from '@settings/providers/settings.provider'
import { Button, Icon } from 'copilot-design-system'
import { useState } from 'react'
import { Banner } from '@/features/banner'

interface ChangeBannerPanelProps {
  onBack: () => void
}

export const ChangeBannerPanel = ({ onBack }: ChangeBannerPanelProps) => {
  const bannerUrls = useSettingsStore((store) => store?.bannerUrls)
  const bannerId = useSettingsStore((store) => store?.bannerImageId)

  const [selectedImage, setSelectedImage] = useState(bannerUrls?.find((item) => item.bannerId === bannerId))

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
          <Banner src={selectedImage?.bannerUrl ?? ''} alt="gg" />
          <Button
            label="Upload image"
            variant="secondary"
            onClick={() => console.info('Info: update banner image')}
            className="w-full"
          />
        </div>
        <div className="flex flex-col items-start gap-y-[12px] self-stretch">
          <span className="text-[12px] text-text-secondary leading-[20px]">Image library </span>
          {bannerUrls?.map((banner) => (
            <button
              key={banner.bannerId}
              onClick={() => setSelectedImage(banner)}
              className="block w-full cursor-pointer border-none bg-transparent p-0"
              type="button"
            >
              <Banner
                src={banner?.bannerUrl ?? ''}
                alt="gg"
                isSelected={selectedImage?.bannerId === banner?.bannerId}
              />
            </button>
          ))}
        </div>
      </div>
      {selectedImage?.bannerId !== bannerId && (
        <div className="mt-auto flex flex-row items-start gap-[10px] border-border-gray border-t px-6 py-3">
          <Button label="Change" variant="primary" onClick={() => console.info('Info: save changes')} />
          <Button label="Cancel" variant="secondary" onClick={() => console.info('Info: cancel changes')} />
        </div>
      )}
    </div>
  )
}
