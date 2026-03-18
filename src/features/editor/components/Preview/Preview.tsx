import { Loader } from '@common/components/Loader'
import { ReadonlyEditor } from '@editor/components/Editor/ReadonlyEditor'
import { PreviewTopBar } from '@editor/components/Preview/PreviewTopBar'
import { DisplayMode, useViewStore } from '@editor/stores/viewStore'
import { ActionsCard } from '@/features/action-items/components/actions-card'
import { Banner } from '@/features/banner'
import { isDarkColor } from '@/utils/color'
import { cn } from '@/utils/tailwind'
import { Heading } from '../Heading'
import { Subheading } from '../Subheading'

interface PreviewProps {
  token: string
  content: string
  backgroundColor: string
  bannerUrl?: string | null
  bannerPositionX?: number
  bannerPositionY?: number
}

export function Preview({
  token,
  content,
  backgroundColor,
  bannerUrl,
  bannerPositionX,
  bannerPositionY,
}: PreviewProps) {
  const displayMode = useViewStore((store) => store.displayMode)
  const workspace = useViewStore((store) => store.workspace)
  const isDark = isDarkColor(backgroundColor)

  return (
    <div
      className={cn(
        'mx-auto flex h-full flex-col overflow-hidden rounded-lg border-gray-200 bg-white max-[860px]:rounded-none max-[860px]:border-0 max-[860px]:shadow-none min-[860px]:border min-[860px]:shadow-sm',
        {
          'max-w-sm': displayMode === DisplayMode.MOBILE,
        },
      )}
    >
      <PreviewTopBar url={workspace?.portalUrl} />

      <div className="preview-scrollable min-h-0 flex-1 overflow-auto border-gray-200 border-t">
        {!workspace ? (
          <div className="flex min-h-32 items-center justify-center">
            <Loader />
          </div>
        ) : (
          <div
            className={cn('@container flex w-full flex-col gap-5 overflow-auto px-6 py-5', isDark && 'dark')}
            style={{ backgroundColor, '--bg-color': backgroundColor } as React.CSSProperties}
          >
            <div className="flex flex-col gap-1.5">
              <Heading />
              <Subheading readonly />
            </div>
            {bannerUrl ? (
              <Banner src={bannerUrl} alt="Workspace Banner" positionX={bannerPositionX} positionY={bannerPositionY} />
            ) : null}
            <ActionsCard />
            <ReadonlyEditor content={content} token={token} />
          </div>
        )}
      </div>
    </div>
  )
}
