import { Loader } from '@common/components/Loader'
import { ReadonlyEditor } from '@editor/components/Editor/ReadonlyEditor'
import { PreviewTopBar } from '@editor/components/Preview/PreviewTopBar'
import { DisplayMode, useViewStore } from '@editor/stores/viewStore'
import { ActionsCard } from '@/features/action-items/components/actions-card'
import { Banner } from '@/features/banner'
import { cn } from '@/utils/tailwind'
import { Heading } from '../Heading'
import { Subheading } from '../Subheading'

interface PreviewProps {
  token: string
  content: string
  backgroundColor: string
  bannerUrl?: string | null
}

export function Preview({ token, content, backgroundColor, bannerUrl }: PreviewProps) {
  const displayMode = useViewStore((store) => store.displayMode)
  const workspace = useViewStore((store) => store.workspace)

  return (
    <div
      className={cn(
        'mx-auto flex h-full flex-col overflow-hidden rounded-lg @max-md:rounded-t-none border border-gray-200 bg-white shadow-sm',
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
          <div className="@container w-full px-6 py-5" style={{ backgroundColor }}>
            <Heading />
            <Subheading readonly />
            {bannerUrl ? <Banner src={bannerUrl} alt="Workspace Banner" className="my-6" /> : null}

            <ActionsCard />

            <ReadonlyEditor content={content} token={token} />
          </div>
        )}
      </div>
    </div>
  )
}
