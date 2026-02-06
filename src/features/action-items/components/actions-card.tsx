import { useViewStore, ViewMode } from '@editor/stores/viewStore'
import { useEnabledActions } from '@settings/hooks/useEnabledActions'
import { useEffect, useState } from 'react'
import { HandleBarTemplate } from '@/features/handlebar-template/components/handle-bar-template'
import { cn } from '@/utils/tailwind'
import { ActionItem } from './action-item'

interface ActionCardProps {
  readonly?: boolean
}

export const ActionsCard = ({ readonly }: ActionCardProps) => {
  const { enabledActions } = useEnabledActions()
  const viewMode = useViewStore((store) => store.viewMode)
  const [isLoading, setIsLoading] = useState(true)

  const workspace = useViewStore((store) => store.workspace)

  const isPreviewMode = readonly || viewMode === ViewMode.PREVIEW

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  if (!enabledActions.length) {
    return null
  }

  return (
    <div className="relative rounded-2xl border border-background-primary bg-gray-100 p-6 shadow-sm transition-all duration-500">
      <div className="mb-4">
        <h2 className="mb-2 text-heading-xl">Your Actions</h2>
        <div className="text-body-md text-text-secondary">
          You have{' '}
          <HandleBarTemplate
            isLoading={isLoading}
            template="{{action.count}}"
            mode={isPreviewMode ? ViewMode.PREVIEW : ViewMode.EDITOR}
            fallbackValue={readonly ? undefined : 12}
          />{' '}
          pending items
        </div>
      </div>

      <div
        className={cn(
          'grid @uxs:grid-cols-2 grid-cols-1 gap-4',
          enabledActions.length > 2 ? '@lg:grid-cols-3' : '@lg:grid-cols-2',
          enabledActions.length > 3 ? '@xl:grid-cols-4' : '',
        )}
      >
        {enabledActions.map((action) => (
          <ActionItem
            key={action.key}
            isLoading={isLoading}
            action={action}
            mode={isPreviewMode ? ViewMode.PREVIEW : ViewMode.EDITOR}
            portalUrl={workspace?.portalUrl}
          />
        ))}
      </div>
    </div>
  )
}
