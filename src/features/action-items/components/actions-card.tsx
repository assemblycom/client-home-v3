import { useViewStore, ViewMode } from '@editor/stores/viewStore'
import { useNotificationCounts } from '@notification-counts/hooks/useNotificationCounts'
import type { NotificationCountsDto } from '@notification-counts/notification-counts.dto'
import { useEnabledActions } from '@settings/hooks/useEnabledActions'
import { HandleBarTemplate } from '@/features/handlebar-template/components/handle-bar-template'
import { cn } from '@/utils/tailwind'
import { ActionItem } from './action-item'

interface ActionCardProps {
  readonly?: boolean
}

export const ActionsCard = ({ readonly }: ActionCardProps) => {
  const { enabledActions } = useEnabledActions()
  const viewMode = useViewStore((store) => store.viewMode)
  const workspace = useViewStore((store) => store.workspace)
  const { counts, isLoading } = useNotificationCounts()

  const isPreviewMode = readonly || viewMode === ViewMode.PREVIEW

  if (!enabledActions.length) {
    return null
  }

  const totalCount = counts
    ? enabledActions.reduce((sum, action) => sum + (counts[action.key as keyof NotificationCountsDto] ?? 0), 0)
    : isPreviewMode
      ? 12
      : undefined

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
            fallbackValue={totalCount}
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
            count={counts?.[action.key as keyof NotificationCountsDto]}
          />
        ))}
      </div>
    </div>
  )
}
