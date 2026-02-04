import { Loader } from '@common/components/Loader'
import { ReadonlyEditor } from '@editor/components/Editor/ReadonlyEditor'
import { PreviewTopBar } from '@editor/components/Preview/PreviewTopBar'
import { DisplayMode, useViewStore } from '@editor/stores/viewStore'
import { ActionsCard } from '@/features/action-items/components/actions-card'
import { cn } from '@/utils/tailwind'
import { Heading } from '../Heading'
import { Subheading } from '../Subheading'

interface PreviewProps {
  token: string
  content: string
  backgroundColor: string
}

export function Preview({ token, content, backgroundColor }: PreviewProps) {
  const displayMode = useViewStore((store) => store.displayMode)
  const workspace = useViewStore((store) => store.workspace)

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

      <div className="flex min-h-32 flex-1 flex-col items-center justify-center p-6">
        {!workspace ? (
          <Loader />
        ) : (
          <div className="tiptap-wrapper @container w-full overflow-auto" style={{ backgroundColor }}>
            <Heading />
            <Subheading readonly />
            <ActionsCard />

            <ReadonlyEditor content={content} token={token} />
          </div>
        )}
      </div>
    </div>
  )
}
