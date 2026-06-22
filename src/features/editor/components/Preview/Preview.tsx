import { Loader } from '@common/components/Loader'
import { ReadonlyEditor } from '@editor/components/Editor/ReadonlyEditor'
import { PreviewTopBar } from '@editor/components/Preview/PreviewTopBar'
import { DisplayMode, useViewStore } from '@editor/stores/viewStore'
import { useSettingsStore } from '@settings/providers/settings.provider'
import { ActionsCard } from '@/features/action-items/components/actions-card'
import { Banner } from '@/features/banner'
import { isDarkColor } from '@/utils/color'
import { cn } from '@/utils/tailwind'
import { Heading } from '../Heading'
import { Subheading } from '../Subheading'

interface PreviewProps {
  content: string
  backgroundColor: string
  bannerUrl?: string | null
  bannerPositionX?: number
  bannerPositionY?: number
}

export function Preview({ content, backgroundColor, bannerUrl, bannerPositionX, bannerPositionY }: PreviewProps) {
  const displayMode = useViewStore((store) => store.displayMode)
  const workspace = useViewStore((store) => store.workspace)
  const showGreeting = useSettingsStore((store) => store.showGreeting)
  const isDark = isDarkColor(backgroundColor)

  return (
    <div
      className={cn(
        'mx-auto flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm',
        {
          'max-w-sm': displayMode === DisplayMode.MOBILE,
        },
      )}
    >
      <PreviewTopBar url={workspace?.portalUrl} />

      <div className="preview-scrollable min-h-0 flex-1 overflow-y-auto overflow-x-hidden border-gray-200 border-t">
        {!workspace ? (
          <div className="flex min-h-32 items-center justify-center">
            <Loader />
          </div>
        ) : (
          <div
            className={cn('@container flex w-full flex-col gap-5 px-6 py-5', isDark && 'dark')}
            style={{ backgroundColor, '--bg-color': backgroundColor } as React.CSSProperties}
          >
            {showGreeting && (
              <div className="flex flex-col gap-1.5">
                <Heading readonly />
                <Subheading readonly />
              </div>
            )}
            {bannerUrl ? (
              <Banner src={bannerUrl} alt="Workspace Banner" positionX={bannerPositionX} positionY={bannerPositionY} />
            ) : null}
            <ActionsCard />
            <ReadonlyEditor content={content} />
          </div>
        )}
      </div>
    </div>
  )
}
